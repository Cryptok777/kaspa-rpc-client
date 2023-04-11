import { PrivateKey } from "../wasm/kaspa_wasm"
import { RPC } from "../types/custom-types"
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

  /**
   * Sends all the available balance to the specified recipient
   */
  async sendAll(options: SendCommonProps) {
    const { recipient, fee = Config.DEFAULT_FEE, priorityFee = 0 } = options
    if (!recipient) {
      throw new Error("params missing")
    }

    const utxos = await this.utxos()
    const balance = Utils.getUtxosSum(utxos)

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Utils.estimateFee({
        utxos,
        recipient,
        amount: balance,
      })
    }

    const amountAfterFee = balance - finalizedFee - BigInt(priorityFee)

    return Utils.sendTransaction({
      clientProvider: this.clientProvider,
      utxos,
      privateKeys: [this.privateKey],
      recipient,
      amount: amountAfterFee,
      changeAddress: recipient,
      fee: finalizedFee,
      priorityFee,
    })
  }

  /**
   * Sends `amount` to `recipient`
   */
  async send({
    recipient,
    amount,
    changeAddress = this.address,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendProps &
    SendCommonProps): Promise<RPC.SubmitTransactionResponseMessage> {
    if (!recipient || !amount || !changeAddress) {
      throw new Error("params missing")
    }

    const utxos = await this.utxos()

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Utils.estimateFee({
        utxos,
        recipient,
        amount,
      })
    }

    return Utils.sendTransaction({
      clientProvider: this.clientProvider,
      utxos,
      privateKeys: [this.privateKey],
      recipient,
      amount,
      changeAddress,
      fee: finalizedFee,
      priorityFee,
    })
  }

  /**
   * Return balance of the address
   */
  balance() {
    return this.clientProvider
      .getBalanceByAddress({
        address: this.address,
      })
      .then((resp) => BigInt(resp.balance))
  }

  /**
   * Return a list of UTXOs for the address
   */
  utxos() {
    return this.clientProvider
      .getUtxosByAddresses({
        addresses: [this.address],
      })
      .then((resp) => resp.entries)
  }

  /**
   * Return a string representation of the address
   * e.g. kaspa:xxxxxx
   */
  toString() {
    return this.address
  }
}
