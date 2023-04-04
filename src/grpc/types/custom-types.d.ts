import {
  GrpcObject,
  ServiceClientConstructor,
} from '@grpc/grpc-js/build/src/make-client'
export { ServiceClientConstructor }

export type bytes = string // base84 string
export * from './rpc'

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
  callback: function
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
