import { PrivateKey } from "../wasm/kaspa_wasm"
import { ClientProvider } from "./ClientProvider"
import {
  AddressSendProps,
  RPC,
  SendAllProps,
  SendCommonProps,
} from "../types/custom-types"
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
   * Sends all the available balance to the specified `recipient`
   */
  async sendAll({
    recipient,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendAllProps) {
    if (!recipient) {
      throw new Error("params missing")
    }

    const utxos = await this.utxos()
    const balance = Utils.getUtxosSum(utxos)
    const outputs = [{ recipient, amount: balance }]

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Utils.estimateFee({
        utxos,
        outputs,
      })
    }

    const amountAfterFee = balance - finalizedFee - BigInt(priorityFee)
    outputs[0].amount = amountAfterFee

    return Utils.sendTransaction({
      clientProvider: this.clientProvider,
      utxos,
      privateKeys: [this.privateKey],
      outputs,
      changeAddress: recipient,
      fee: finalizedFee,
      priorityFee,
    })
  }

  /**
   * Create and submit a transaction, where `ouputs` can contain
   *  multiple `recipient`
   */
  async send({
    outputs,
    changeAddress = this.address,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: AddressSendProps &
    SendCommonProps): Promise<RPC.SubmitTransactionResponseMessage> {
    if (outputs.length === 0 || !changeAddress) {
      throw new Error("params missing")
    }

    const utxos = await this.utxos()

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Utils.estimateFee({
        utxos,
        outputs,
      })
    }

    return Utils.sendTransaction({
      clientProvider: this.clientProvider,
      utxos,
      privateKeys: [this.privateKey],
      outputs,
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
