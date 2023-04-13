import { RpcClient } from "../rpc/rpc"
import { RPC as Rpc } from "../types/custom-types"
import { ClientProvider } from "./ClientProvider"

export class Client extends ClientProvider {
  rpc: RpcClient
  ready = false

  constructor({ host, verbose }: { host: string; verbose?: boolean }) {
    super()
    this.rpc = new RpcClient({
      host,
      verbose,
    })
  }

  async connect() {
    return this.rpc.connect()
  }

  disconnect() {
    this.rpc.disconnect()
  }

  isReady(): boolean {
    return this.ready
  }

  async ping() {
    try {
      const resp = await this.getInfo()
      const synced = resp.isSynced
      const indexed = resp.isUtxoIndexed
      this.ready = synced && indexed
    } catch (error) {
      this.ready = false
    }
    return this.ready
  }

  request<T>(method: string, data: any) {
    return this.rpc.call(method, data) as Promise<T>
  }

  subscribe<T, R>(method: string, data: any, callback: Rpc.callback<R>) {
    return this.rpc.subscribe<T>(method, data, callback)
  }

  unSubscribe(method: string, uid = "") {
    return this.rpc.unSubscribe(method, uid)
  }

  getBlock(data: Rpc.GetBlockRequestMessage) {
    return this.request<Rpc.GetBlockResponseMessage>("getBlockRequest", data)
  }

  getUtxosByAddresses(data: Rpc.GetUtxosByAddressesRequestMessage) {
    return this.request<Rpc.GetUtxosByAddressesResponseMessage>(
      "getUtxosByAddressesRequest",
      data
    )
  }

  getBalanceByAddress(data: Rpc.GetBalanceByAddressRequestMessage) {
    return this.request<Rpc.GetBalanceByAddressResponseMessage>(
      "getBalanceByAddressRequest",
      data
    )
  }

  getBalancesByAddresses(data: Rpc.GetBalancesByAddressesRequestMessage) {
    return this.request<Rpc.GetBalancesByAddressesResponseMessage>(
      "getBalancesByAddressesRequest",
      data
    )
  }

  getVirtualSelectedParentBlueScore() {
    return this.request<Rpc.GetVirtualSelectedParentBlueScoreResponseMessage>(
      "getVirtualSelectedParentBlueScoreRequest",
      {}
    )
  }

  submitBlock(data: Rpc.SubmitBlockRequestMessage) {
    return this.request<Rpc.SubmitBlockResponseMessage>(
      "submitBlockRequest",
      data
    )
  }

  getBlockTemplate(data: Rpc.GetBlockTemplateRequestMessage) {
    return this.request<Rpc.GetBlockTemplateResponseMessage>(
      "getBlockTemplateRequest",
      data
    )
  }

  submitTransaction(data: Rpc.SubmitTransactionRequestMessage) {
    return this.request<Rpc.SubmitTransactionResponseMessage>(
      "submitTransactionRequest",
      data
    )
  }

  getBlockDagInfo() {
    return this.request<Rpc.GetBlockDagInfoResponseMessage>(
      "getBlockDagInfoRequest",
      {}
    )
  }

  getInfo() {
    return this.request<Rpc.GetInfoResponseMessage>("getInfoRequest", {})
  }

  estimateNetworkHashesPerSecond(
    data: Rpc.EstimateNetworkHashesPerSecondRequestMessage
  ) {
    return this.request<Rpc.EstimateNetworkHashesPerSecondResponseMessage>(
      "estimateNetworkHashesPerSecondRequest",
      data
    )
  }

  getCoinSupply() {
    return this.request<Rpc.GetCoinSupplyResponseMessage>(
      "getCoinSupplyRequest",
      {}
    )
  }

  getCurrentNetwork() {
    return this.request<Rpc.GetCurrentNetworkResponseMessage>(
      "getCurrentNetworkRequest",
      {}
    )
  }

  getPeerAddresses() {
    return this.request<Rpc.GetPeerAddressesResponseMessage>(
      "getPeerAddressesRequest",
      {}
    )
  }

  getSelectedTipHash() {
    return this.request<Rpc.GetSelectedTipHashResponseMessage>(
      "getSelectedTipHashRequest",
      {}
    )
  }

  getMempoolEntry(data: Rpc.GetMempoolEntryRequestMessage) {
    return this.request<Rpc.GetMempoolEntryResponseMessage>(
      "getMempoolEntryRequest",
      data
    )
  }

  getMempoolEntries(data: Rpc.GetMempoolEntriesRequestMessage) {
    return this.request<Rpc.GetMempoolEntriesResponseMessage>(
      "getMempoolEntriesRequest",
      data
    )
  }

  getConnectedPeerInfo() {
    return this.request<Rpc.GetConnectedPeerInfoResponseMessage>(
      "getConnectedPeerInfoRequest",
      {}
    )
  }

  getSubnetwork(data: Rpc.GetSubnetworkRequestMessage) {
    return this.request<Rpc.GetSubnetworkResponseMessage>(
      "getSubnetworkRequest",
      data
    )
  }

  getVirtualSelectedParentChainFromBlock(
    data: Rpc.GetVirtualSelectedParentChainFromBlockRequestMessage
  ) {
    return this.request<Rpc.GetVirtualSelectedParentChainFromBlockResponseMessage>(
      "getVirtualSelectedParentChainFromBlockRequest",
      data
    )
  }

  getBlocks(data: Rpc.GetBlocksRequestMessage) {
    return this.request<Rpc.GetBlocksResponseMessage>("getBlocksRequest", data)
  }

  getBlockCount() {
    return this.request<Rpc.GetBlockCountResponseMessage>(
      "getBlockCountRequest",
      {}
    )
  }

  getHeaders(data: Rpc.GetHeadersRequestMessage) {
    return this.request<Rpc.GetHeadersResponseMessage>(
      "getHeadersRequest",
      data
    )
  }

  getMempoolEntriesByAddresses(
    data: Rpc.GetMempoolEntriesByAddressesRequestMessage
  ) {
    return this.request<Rpc.GetMempoolEntriesByAddressesResponseMessage>(
      "getMempoolEntriesByAddressesRequest",
      data
    )
  }

  subscribeNewBlockTemplate(
    callback: Rpc.callback<Rpc.NewBlockTemplateNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyNewBlockTemplateResponseMessage,
      Rpc.NewBlockTemplateNotificationMessage
    >("notifyNewBlockTemplateRequest", {}, callback)
  }

  unSubscribeNewBlockTemplate(uid = "") {
    this.unSubscribe("notifyNewBlockTemplateRequest", uid)
  }

  subscribeVirtualDaaScoreChanged(
    callback: Rpc.callback<Rpc.VirtualDaaScoreChangedNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyVirtualDaaScoreChangedResponseMessage,
      Rpc.VirtualDaaScoreChangedNotificationMessage
    >("notifyVirtualDaaScoreChangedRequest", {}, callback)
  }

  unSubscribeVirtualDaaScoreChanged(uid = "") {
    this.unSubscribe("notifyVirtualDaaScoreChangedRequest", uid)
  }

  subscribePruningPointUTXOSetOverride(
    callback: Rpc.callback<Rpc.PruningPointUTXOSetOverrideNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyPruningPointUTXOSetOverrideResponseMessage,
      Rpc.PruningPointUTXOSetOverrideNotificationMessage
    >("notifyPruningPointUTXOSetOverrideRequest", {}, callback)
  }

  unSubscribePruningPointUTXOSetOverride(uid = "") {
    this.unSubscribe("notifyPruningPointUTXOSetOverrideRequest", uid)
  }

  subscribeBlockAdded(
    callback: Rpc.callback<Rpc.BlockAddedNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyBlockAddedResponseMessage,
      Rpc.BlockAddedNotificationMessage
    >("notifyBlockAddedRequest", {}, callback)
  }

  unSubscribeBlockAdded(uid = "") {
    this.unSubscribe("notifyBlockAddedRequest", uid)
  }

  subscribeVirtualSelectedParentBlueScoreChanged(
    callback: Rpc.callback<Rpc.VirtualSelectedParentBlueScoreChangedNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyVirtualSelectedParentBlueScoreChangedResponseMessage,
      Rpc.VirtualSelectedParentBlueScoreChangedNotificationMessage
    >("notifyVirtualSelectedParentBlueScoreChangedRequest", {}, callback)
  }

  unSubscribeVirtualSelectedParentBlueScoreChanged(uid = "") {
    this.unSubscribe("notifyVirtualSelectedParentBlueScoreChangedRequest", uid)
  }

  subscribeUtxosChanged(
    data: Rpc.NotifyUtxosChangedRequestMessage,
    callback: Rpc.callback<Rpc.UtxosChangedNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyUtxosChangedResponseMessage,
      Rpc.UtxosChangedNotificationMessage
    >("notifyUtxosChangedRequest", data, callback)
  }

  unSubscribeUtxosChanged(uid = "") {
    this.unSubscribe("notifyUtxosChangedRequest", uid)
  }

  subscribeVirtualSelectedParentChainChanged(
    data: Rpc.NotifyVirtualSelectedParentChainChangedRequestMessage,
    callback: Rpc.callback<Rpc.VirtualSelectedParentChainChangedNotificationMessage>
  ) {
    return this.subscribe<
      Rpc.NotifyVirtualSelectedParentChainChangedResponseMessage,
      Rpc.VirtualSelectedParentChainChangedNotificationMessage
    >("notifyVirtualSelectedParentChainChangedRequest", data, callback)
  }

  unSubscribeVirtualSelectedParentChainChanged(uid = "") {
    this.unSubscribe("notifyVirtualSelectedParentChainChangedRequest", uid)
  }
}
