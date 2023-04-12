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

  /**
   * The change address of the transaction, can be address string or
   * Address Object that's created from the library
   */
  changeAddress: string | Address
}

export interface SendOutputProps {
  /**
   * The recipient of the transaction, can be address string or
   * Address Object that's created from the library
   */
  recipient: string | Address

  /**
   * Amount to send, the unit is sompi
   */
  amount: bigint
}

export interface SendCommonProps {
  /**
   * The outputs of the transaction, each output has key
   * `recipient` and `amount`
   */
  outputs: SendOutputProps[]

  /**
   * The transaction fee. Defaults to 0.
   * If `fee` is not passed, the library will figure out the network
   * fee and subtract it from the final amount
   */
  fee?: bigint

  /**
   * The priority fee of the transaction. Defaults to `0`.
   */
  priorityFee?: number
}

export interface AddressSendProps {
  /**
   * Optional, the change address of the transaction, can be address string or
   * Address Object that's created from the library
   */
  changeAddress?: string | Address
}

export interface AccountSendProps {
  /**
   * The change address of the transaction, can be address string or
   * Address Object that's created from the library
   */
  changeAddress: string | Address
}

export interface SendAllProps {
  /**
   * The recipient of the transaction, can be address string or
   * Address Object that's created from the library
   */
  recipient: string | Address
  /**
   * The transaction fee. Defaults to 0.
   * If `fee` is not passed, the library will figure out the network
   * fee and subtract it from the final amount
   */
  fee?: bigint
  /**
   * The priority fee of the transaction. Defaults to `0`.
   */
  priorityFee?: number
}

export interface CreateTransactionProps {
  /**
   * A UtxoSet object, can be created by `UtxoSet.from({ entries: UTXO_FROM_RPC })`
   */
  utxoSet: UtxoSet

  /**
   * The outputs of the transaction, each output has key
   * `recipient` and `amount`
   */
  outputs: SendOutputProps[]

  /**
   * The change address of the transaction, can be address string or
   * Address Object that's created from the library
   */
  changeAddress: string | Address

  /**
   * The transaction fee. Defaults to 0.
   * If `fee` is not passed, the library will figure out the network
   * fee and subtract it from the final amount
   */
  fee?: bigint

  /**
   * The priority fee of the transaction. Defaults to `0`.
   */
  priorityFee?: number
}
