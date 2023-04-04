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
  RPC as Rpc,
  SetTimeoutType,
  ClientOptionsTypes,
  ClientProps,
} from "../types/custom-types"
import { resolve } from "path"

const delay = (delay: number, fn: () => void): SetTimeoutType => {
  return setTimeout(fn, delay || 0)
}

const clearDelay = (id: SetTimeoutType) => {
  clearTimeout(id)
}

export class Client {
  client: any | undefined
  options: ClientOptionsTypes
  stream: IStream
  pending: PendingReqs
  reconnectDelay: SetTimeoutType | undefined
  proto: KaspadPackage | undefined
  subscribers: SubscriberItemMap = new Map()

  verbose: boolean = false
  isConnected: boolean = false

  intakeHandler: Function | undefined
  connectCBs: Function[] = []
  connectFailureCBs: Function[] = []
  errorCBs: Function[] = []
  disconnectCBs: Function[] = []

  constructor(options: ClientProps) {
    const defaultOptions = {
      protoPath: __dirname + "/../proto/messages.proto",
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

    const proto: MessagesProto = <MessagesProto>(
      gRPC.loadPackageDefinition(packageDefinition)
    )
    this.proto = proto.protowire
    const { RPC } = proto.protowire
    return RPC
  }

  connect() {
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
        }
      )
    } else {
      return new Promise((resolve) => {
        this.onConnect(resolve)
      })
    }

    await this._connectClient()
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
    this.client.waitForReady(2500, (connect_error: any) => {
      if (connect_error) {
        this._reconnect("client connect deadline reached")
        return resolve()
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

      if (this.options.disableConnectionCheck) return resolve()

      delay(100, async () => {
        let response: any = await this.call(
          "getVirtualSelectedParentBlueScoreRequest",
          {}
        ).catch((e) => {
          this.connectFailureCBs.forEach((fn) => fn(e))
        })
        this.log("getVirtualSelectedParentBlueScoreRequest:response", response)
        if (response && response.blueScore) {
          this._setConnected(true)
        }
        resolve()
      })
    })
  }

  _setConnected(isConnected: boolean) {
    if (this.isConnected == isConnected) return
    this.isConnected = isConnected

    let cbs = isConnected ? this.connectCBs : this.disconnectCBs
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
    this.clearPending()
  }

  clearPending(reason?: string) {
    Object.keys(this.pending).forEach((key) => {
      let list = this.pending[key]
      list.forEach((o) => o.reject(reason || "closing by force"))
      this.pending[key] = []
    })
  }

  close() {
    this.disconnect()
  }

  createStream() {
    if (!this.client) return null
    const stream = this.client.MessageStream(() => {})
    return stream
  }

  initIntake(stream: IStream) {
    stream.on("data", (data: any) => {
      if (data.payload) {
        let name = data.payload
        let payload = data[name]
        let ident = name.replace(/^get|Response$/gi, "").toLowerCase()
        this.handleIntake({ name, payload, ident })
      }
    })
  }

  handleIntake(o: IData) {
    if (this.intakeHandler) {
      this.intakeHandler(o)
    } else {
      let handlers = this.pending[o.name]
      this.log("intake:", o, "handlers:", handlers)
      if (handlers && handlers.length) {
        let pending: QueueItem | undefined = handlers.shift()
        if (pending) pending.resolve(o.payload)
      }

      let subscribers: SubscriberItem[] | undefined = this.subscribers.get(
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

    let req = {
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
      let stream = this.stream
      if (!stream) {
        this.log("could not create stream")
        return reject("not connected")
      }

      const resp = method.replace(/Request$/, "Response")
      if (!this.pending[resp]) this.pending[resp] = []
      let handlers: QueueItem[] = this.pending[resp]
      handlers.push({ method, data, resolve, reject })

      this.post(method, data)
    })
  }

  subscribe<T>(
    subject: string,
    data: any = {},
    callback: Function
  ): Rpc.SubPromise<T> {
    if (typeof data == "function") {
      callback = data
      data = {}
    }

    this.log("subscribe to", subject)
    if (!this.client)
      return Promise.reject("not connected") as Rpc.SubPromise<T>

    let eventName = this.subjectToEventName(subject)
    this.log("subscribe:eventName", eventName)

    let subscribers: SubscriberItem[] | undefined =
      this.subscribers.get(eventName)
    if (!subscribers) {
      subscribers = []
      this.subscribers.set(eventName, subscribers)
    }
    let uid = (Math.random() * 100000 + Date.now()).toFixed(0)
    subscribers.push({ uid, callback })

    let p = this.call(subject, data) as Rpc.SubPromise<T>

    p.uid = uid
    return p
  }

  subjectToEventName(subject: string) {
    let eventName = subject
      .replace("notify", "")
      .replace("Request", "Notification")
    return eventName[0].toLowerCase() + eventName.substr(1)
  }

  unSubscribe(subject: string, uid: string = "") {
    let eventName = this.subjectToEventName(subject)
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
