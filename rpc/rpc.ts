import * as gRPC from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import {
  PendingReqs,
  IData,
  IStream,
  QueueItem,
  MessagesProto,
  ServiceClientConstructor,
  KaspadPackage,
  SubscriberItem,
  SubscriberItemMap,
  RPC,
  SetTimeoutType,
  ClientOptionsTypes,
  ClientProps,
} from "../types/custom-types"

const delay = (delay: number, fn: () => void): SetTimeoutType => {
  return setTimeout(fn, delay || 0)
}

const clearDelay = (id: SetTimeoutType) => {
  clearTimeout(id)
}

export class RpcClient {
  client: any | undefined
  options: ClientOptionsTypes
  stream: IStream
  pending: PendingReqs
  reconnectDelay: SetTimeoutType | undefined
  proto: KaspadPackage | undefined
  subscribers: SubscriberItemMap = new Map()

  verbose = false
  isConnected = false

  intakeHandler: Function | undefined
  connectCBs: Function[] = []
  connectFailureCBs: Function[] = []
  errorCBs: Function[] = []
  disconnectCBs: Function[] = []

  constructor(options: ClientProps) {
    const defaultOptions = {
      protoPath: __dirname + "/messages.proto",
      host: "localhost:16210",
      reconnect: true,
      verbose: false,
      uid: (Math.random() * 1000).toFixed(0),
      disableConnectionCheck: false,
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.pending = {}
  }

  getServiceClient(): ServiceClientConstructor {
    const { protoPath } = this.options
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    })

    const proto: MessagesProto = gRPC.loadPackageDefinition(
      packageDefinition
    ) as MessagesProto
    this.proto = proto.protowire
    const { RPC } = proto.protowire
    return RPC
  }

  async connect() {
    this.options.reconnect = true
    return this._connect()
  }

  async _connect() {
    this.log("gRPC Client connecting to", this.options.host)
    if (!this.client) {
      const RPC = this.getServiceClient()
      this.client = new RPC(
        this.options.host,
        gRPC.credentials.createInsecure(),
        {
          "grpc.max_receive_message_length": -1,
          "grpc.enable_retries": 1,
          "grpc.keepalive_timeout_ms": 30000,
        }
      )
    } else {
      return new Promise((resolve) => {
        this.onConnect(resolve)
      })
    }

    return this._connectClient()
  }

  _reconnect(reason: string) {
    this._setConnected(false)
    if (this.reconnectDelay) {
      clearDelay(this.reconnectDelay)
      delete this.reconnectDelay
    }

    this.clearPending(reason)
    delete this.stream
    if (this.options.reconnect) {
      this.reconnectDelay = delay(1000, () => {
        this._connectClient()
      })
    }
  }

  async _connectClient() {
    const deadline = new Date()
    deadline.setSeconds(deadline.getSeconds() + 2)

    return new Promise((resolve) => {
      this.client.waitForReady(deadline, (connect_error: any) => {
        if (connect_error) {
          this._reconnect("client connect deadline reached")
          return resolve(false)
        }
  
        this.log("client connected")
  
        this.stream = this.createStream()
        this.initIntake(this.stream)
  
        this.stream.on("error", (error: any) => {
          this.errorCBs.forEach((fn) => fn(error.toString(), error))
          this.log("stream:error", error)
          this._reconnect(error)
        })
  
        this.stream.on("end", (...args: any) => {
          this.log("stream:end", ...args)
          this._reconnect("stream end")
        })
  
        if (this.options.disableConnectionCheck) return resolve(true)
  
        delay(100, async () => {
          const response: any = await this.call(
            "getVirtualSelectedParentBlueScoreRequest",
            {}
          ).catch((e) => {
            this.connectFailureCBs.forEach((fn) => fn(e))
          })
          this.log("getVirtualSelectedParentBlueScoreRequest:response", response)
          if (response && response.blueScore) {
            this._setConnected(true)
          }
          return resolve(true)
        })
      })
    })

  }

  _setConnected(isConnected: boolean) {
    if (this.isConnected == isConnected) return
    this.isConnected = isConnected

    const cbs = isConnected ? this.connectCBs : this.disconnectCBs
    cbs.forEach((fn) => {
      fn()
    })
  }

  onConnect(callback: Function) {
    this.connectCBs.push(callback)
    if (this.isConnected) callback()
  }

  onConnectFailure(callback: Function) {
    this.connectFailureCBs.push(callback)
  }

  onError(callback: Function) {
    this.errorCBs.push(callback)
  }

  onDisconnect(callback: Function) {
    this.disconnectCBs.push(callback)
  }

  disconnect() {
    if (this.reconnectDelay) {
      clearDelay(this.reconnectDelay)
      delete this.reconnectDelay
    }
    this.options.reconnect = false

    this.stream && this.stream.end()
    this.client && this.client.close();

    this.clearPending()
  }

  clearPending(reason?: string) {
    Object.keys(this.pending).forEach((key) => {
      const list = this.pending[key]
      list.forEach((o) => o.reject(reason || "closing by force"))
      this.pending[key] = []
    })
  }

  createStream() {
    if (!this.client) return null
    const stream = this.client.MessageStream(() => {})
    return stream
  }

  initIntake(stream: IStream) {
    stream.on("data", (data: any) => {
      if (data.payload) {
        const name = data.payload
        const payload = data[name]
        const ident = name.replace(/^get|Response$/gi, "").toLowerCase()
        this.handleIntake({ name, payload, ident })
      }
    })
  }

  handleIntake(o: IData) {
    if (this.intakeHandler) {
      this.intakeHandler(o)
    } else {
      const handlers = this.pending[o.name]
      this.log("intake:", o, "handlers:", handlers)
      if (handlers && handlers.length) {
        const pending: QueueItem | undefined = handlers.shift()
        if (pending) pending.resolve(o.payload)
      }

      const subscribers: SubscriberItem[] | undefined = this.subscribers.get(
        o.name
      )
      if (subscribers) {
        subscribers.map((subscriber) => {
          subscriber.callback(o.payload)
        })
      }
    }
  }

  setIntakeHandler(fn: Function) {
    this.intakeHandler = fn
  }

  post(name: string, args: any = {}) {
    if (!this.stream) return false

    const req = {
      [name]: args,
    }
    this.log("post:", req)
    this.stream.write(req)

    return true
  }

  call(method: string, data: any) {
    this.log("call to", method)
    if (!this.client) return Promise.reject("not connected")

    return new Promise((resolve, reject) => {
      const stream = this.stream
      if (!stream) {
        this.log("could not create stream")
        return reject("not connected")
      }

      const resp = method.replace(/Request$/, "Response")
      if (!this.pending[resp]) this.pending[resp] = []
      const handlers: QueueItem[] = this.pending[resp]
      handlers.push({ method, data, resolve, reject })

      this.post(method, data)
    })
  }

  subscribe<T>(
    subject: string,
    data: any = {},
    callback: Function
  ): RPC.SubPromise<T> {
    if (typeof data == "function") {
      callback = data
      data = {}
    }

    this.log("subscribe to", subject)
    if (!this.client)
      return Promise.reject("not connected") as RPC.SubPromise<T>

    const eventName = this.subjectToEventName(subject)
    this.log("subscribe:eventName", eventName)

    let subscribers: SubscriberItem[] | undefined =
      this.subscribers.get(eventName)
    if (!subscribers) {
      subscribers = []
      this.subscribers.set(eventName, subscribers)
    }
    const uid = (Math.random() * 100000 + Date.now()).toFixed(0)
    subscribers.push({ uid, callback })

    const p = this.call(subject, data) as RPC.SubPromise<T>

    p.uid = uid
    return p
  }

  subjectToEventName(subject: string) {
    const eventName = subject
      .replace("notify", "")
      .replace("Request", "Notification")
    return eventName[0].toLowerCase() + eventName.substr(1)
  }

  unSubscribe(subject: string, uid = "") {
    const eventName = this.subjectToEventName(subject)
    let subscribers: SubscriberItem[] | undefined =
      this.subscribers.get(eventName)
    if (!subscribers) return
    if (!uid) {
      this.subscribers.delete(eventName)
    } else {
      subscribers = subscribers.filter((sub) => sub.uid != uid)
      this.subscribers.set(eventName, subscribers)
    }
  }

  log(message: string, ...args: any) {
    if (!this.options.verbose) return

    const logMessage = `[Kaspa gRPC ${this.options.uid}]:`
    console.log(logMessage, message, ...args)
  }
}
