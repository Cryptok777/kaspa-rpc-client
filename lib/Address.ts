import { UtxoSet, PrivateKey } from "../wasm/kaspa_wasm"
import { RPC as Rpc } from "../types/custom-types"
import { ClientProvider } from "./ClientProvider"
import { SendCommonProps, SendProps } from "../types/custom-types"
import { Utils } from "./Utils"
import { Config } from "./Wallet"

export class Address {
  clientProvider: ClientProvider
  index: number
  address: string
  privateKey: PrivateKey

  constructor(
    clientProvider: ClientProvider,
    index: number,
    address: string,
    privateKey: PrivateKey
  ) {
    this.clientProvider = clientProvider
    this.index = index
    this.address = address
    this.privateKey = privateKey
  }

  async sendAll({
    recipient,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendCommonProps) {
    const utxos = await this.utxos()
    const balance = await this.balance()

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Utils.estimateFee({
        utxos,
        recipient,
        amount: balance,
      })
    }

    const amountAfterFee = balance - finalizedFee - BigInt(priorityFee)

    return this.send({
      recipient,
      amount: amountAfterFee,
      changeAddress: recipient,
      fee: finalizedFee,
      priorityFee,
    })
  }

  async send({
    recipient,
    amount,
    changeAddress = this.address,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendProps &
    SendCommonProps): Promise<Rpc.SubmitTransactionResponseMessage> {
    const utxos = await this.utxos()
    return Utils.sendTransaction({
      clientProvider: this.clientProvider,
      utxos,
      privateKeys: [this.privateKey],
      recipient,
      amount,
      changeAddress,
      fee,
      priorityFee,
    })
  }

  balance() {
    return this.clientProvider
      .getBalanceByAddress({
        address: this.address,
      })
      .then((resp) => BigInt(resp.balance))
  }

  utxos() {
    return this.clientProvider
      .getUtxosByAddresses({
        addresses: [this.address],
      })
      .then((resp) => resp.entries)
  }

  toString() {
    return this.address
  }
}
