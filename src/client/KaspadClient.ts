import { Client as RpcClient } from "../grpc/lib/client"
import { retryAsync } from "ts-retry"
import { RPC } from "../grpc/types/custom-types"

interface RequestProps {
  command: string
  payload?: object
  delay?: number
  retries?: number
}

export default class KaspaClient {
  rpc: RpcClient
  ready: boolean = false

  constructor(host: string) {
    this.rpc = new RpcClient({
      host,
      // verbose: true
    })
    this.rpc.connect()
  }

  async ping() {
    try {
      const resp = (await this.request({
        command: "getInfoRequest",
        delay: 1000,
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
}
