import { RPC as Rpc } from "../types/custom-types"

export class ClientProvider {
  constructor() {}

  getUtxosByAddresses(
    data: Rpc.GetUtxosByAddressesRequestMessage
  ): Promise<Rpc.GetUtxosByAddressesResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalanceByAddress(
    data: Rpc.GetBalanceByAddressRequestMessage
  ): Promise<Rpc.GetBalanceByAddressResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalancesByAddresses(
    data: Rpc.GetBalancesByAddressesRequestMessage
  ): Promise<Rpc.GetBalancesByAddressesResponseMessage> {
    throw new Error("Not implemented")
  }

  submitTransaction(
    data: Rpc.SubmitTransactionRequestMessage
  ): Promise<Rpc.SubmitTransactionResponseMessage> {
    throw new Error("Not implemented")
  }

  getBalances(addresses: string[]) {
    throw new Error("Not implemented")
  }
}
