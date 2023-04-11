import { RPC } from "../types/custom-types"

export class ClientProvider {
  constructor() {}

  getUtxosByAddresses(
    data: RPC.GetUtxosByAddressesRequestMessage
  ): Promise<RPC.GetUtxosByAddressesResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalanceByAddress(
    data: RPC.GetBalanceByAddressRequestMessage
  ): Promise<RPC.GetBalanceByAddressResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalancesByAddresses(
    data: RPC.GetBalancesByAddressesRequestMessage
  ): Promise<RPC.GetBalancesByAddressesResponseMessage> {
    throw new Error("Not implemented")
  }

  submitTransaction(
    data: RPC.SubmitTransactionRequestMessage
  ): Promise<RPC.SubmitTransactionResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalances(addresses: string[]) {
    throw new Error("Not implemented")
  }

  subscribeUtxosChanged(
    data: RPC.NotifyUtxosChangedRequestMessage,
    callback: RPC.callback<RPC.UtxosChangedNotificationMessage>
  ): RPC.SubPromise<RPC.NotifyUtxosChangedResponseMessage> {
    throw new Error("Not implemented")
  }

  unSubscribeUtxosChanged(uid: string = "") {
    throw new Error("Not implemented")
  }
}
