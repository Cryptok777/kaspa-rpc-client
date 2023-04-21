/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import { RPC } from "../types/custom-types"

export class ClientProvider {
  constructor() {}

  getUtxosByAddresses(
    _data: RPC.GetUtxosByAddressesRequestMessage
  ): Promise<RPC.GetUtxosByAddressesResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalanceByAddress(
    _data: RPC.GetBalanceByAddressRequestMessage
  ): Promise<RPC.GetBalanceByAddressResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalancesByAddresses(
    _data: RPC.GetBalancesByAddressesRequestMessage
  ): Promise<RPC.GetBalancesByAddressesResponseMessage> {
    throw new Error("Not implemented")
  }

  submitTransaction(
    _data: RPC.SubmitTransactionRequestMessage
  ): Promise<RPC.SubmitTransactionResponseMessage> {
    throw new Error("Not implemented")
  }

  subscribeUtxosChanged(
    _data: RPC.NotifyUtxosChangedRequestMessage,
    _callback: RPC.callback<RPC.UtxosChangedNotificationMessage>
  ): RPC.SubPromise<RPC.NotifyUtxosChangedResponseMessage> {
    throw new Error("Not implemented")
  }

  unSubscribeUtxosChanged(_uid = "") {
    throw new Error("Not implemented")
  }
}
