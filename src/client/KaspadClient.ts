import { Client as RpcClient } from '../grpc/lib/client'
import { retryAsync } from 'ts-retry'
import { RPC } from '../grpc/types/custom-types'
import { RPC as Rpc } from '../grpc/types/custom-types'
interface RequestProps {
  command: string
  payload?: object
  delay?: number
  retries?: number
}

export class KaspadClient {
  rpc: RpcClient
  ready = false

  constructor({ host, verbose }: { host: string; verbose?: boolean }) {
    this.rpc = new RpcClient({
      host,
      verbose,
    })
  }

  async connect() {
    await this.rpc.connect()
  }

  isReady(): boolean {
    return this.ready
  }

  async ping() {
    try {
      const resp = (await this.request({
        command: 'getInfoRequest',
        retries: 4,
      })) as RPC.GetInfoResponse
      const synced = resp.isSynced
      const indexed = resp.isUtxoIndexed
      this.ready = synced && indexed
    } catch (error) {}
    return this.ready
  }

  async request({ command, payload, delay = 500, retries = 0 }: RequestProps) {
    const rpcCall = async () => {
      return await this.rpc.call(command, payload)
    }

    return await retryAsync(rpcCall, {
      delay,
      maxTry: retries,
    })
  }

  subscribe<T>(
    subject: string,
    data: any = {},
    callback: Function
  ): Rpc.SubPromise<T> {
    return this.rpc.subscribe(subject, data, callback)
  }

  unSubscribe(subject: string) {
    return this.rpc.unSubscribe(subject)
  }
}
