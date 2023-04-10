import {
  GrpcObject,
  ServiceClientConstructor,
} from "@grpc/grpc-js/build/src/make-client"
import { Address } from "../lib/Address"
import { PrivateKey, UtxoSet } from "../wasm/kaspa_wasm"
import { RPC } from "./rpc"
export { ServiceClientConstructor }
import { ClientProvider } from "../lib/ClientProvider"

export type bytes = string // base84 string
export * from "./rpc"
export * from "./rust"

export interface QueueItem {
  method: string
  data: any
  resolve: Function
  reject: Function
}
export interface PendingReqs {
  [index: string]: QueueItem[]
}
export interface IData {
  name: string
  payload: any
  ident: string
}
export declare type IStream = any

export interface KaspadPackage extends GrpcObject {
  RPC: ServiceClientConstructor
}

export interface MessagesProto extends GrpcObject {
  protowire: KaspadPackage
}

export interface SubscriberItem {
  uid: string
  callback: Function
}

export declare type SubscriberItemMap = Map<string, SubscriberItem[]>

export type SetTimeoutType = ReturnType<typeof setTimeout>

export interface ClientProps {
  host?: string
  verbose?: boolean
  disableConnectionCheck?: boolean
}

export type ClientOptionsTypes = {
  host: string
  verbose: boolean
  reconnect: boolean
  uid: string
  protoPath: string
  disableConnectionCheck: boolean
}

export enum AddressType {
  Receive = 0,
  Change = 1,
}

export interface SendTransactionProps {
  utxos: RPC.UtxosByAddressesEntry[]
  privateKeys: PrivateKey[]
  clientProvider: ClientProvider
}

export interface SendProps {
  changeAddress: string | Address
  amount: bigint
}

export interface SendCommonProps {
  recipient: string | Address
  fee?: bigint
  priorityFee?: number
}

export interface CreateTransactionProps {
  utxoSet: UtxoSet
  recipient: string | Address
  changeAddress: string | Address
  amount: bigint
  fee?: bigint
  priorityFee?: number
}
