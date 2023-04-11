import {
  Mnemonic as RustMnemonic,
  XPrv,
  XPublicKey,
  XPrivateKey,
} from "../wasm/kaspa_wasm"
import {
  AddressType,
  RPC as Rpc,
  SendCommonProps,
  SendProps,
} from "../types/custom-types"
import { ClientProvider } from "./ClientProvider"
import { Address } from "./Address"
import { Utils } from "./Utils"
import { Config, Wallet } from "./Wallet"

export class Account {
  private clientProvider: ClientProvider
  index: bigint
  private xPublicKey: XPublicKey
  private xPrivateKey: XPrivateKey
  private scannedAddresses: Address[]

  constructor(
    clientProvider: ClientProvider,
    index: bigint,
    xPublicKey: XPublicKey,
    xPrivateKey: XPrivateKey
  ) {
    this.clientProvider = clientProvider
    this.index = index
    this.xPublicKey = xPublicKey
    this.xPrivateKey = xPrivateKey
    this.scannedAddresses = []
  }

  static async fromPhrase(
    clientProvider: ClientProvider,
    phrase: string,
    index: bigint
  ) {
    const wallet = new Wallet(clientProvider)
    const xPrv = new XPrv(new RustMnemonic(phrase).toSeed(""))
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet.account(index)
  }

  static fromSeed(
    clientProvider: ClientProvider,
    seed: string,
    index: bigint = 0n
  ) {
    const wallet = new Wallet(clientProvider)
    const xPrv = new XPrv(seed)
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet.account(index)
  }

  static fromPrivateKey(
    clientProvider: ClientProvider,
    xPrv: string,
    index: bigint = 0n
  ) {
    const wallet = new Wallet(clientProvider)
    wallet.setRoot(xPrv)
    return wallet.account(index)
  }

  async address(index: number = 0, type: AddressType = AddressType.Receive) {
    let address, key
    if (type === AddressType.Receive) {
      address = (await this.xPublicKey.receiveAddresses(index, index + 1))[0]
      key = this.xPrivateKey.receiveKey(index)
    } else {
      address = (await this.xPublicKey.changeAddresses(index, index + 1))[0]
      key = this.xPrivateKey.changeKey(index)
    }
    return new Address(this.clientProvider, index, address, key)
  }

  async addresses(
    start: number,
    end: number,
    type: AddressType = AddressType.Receive
  ) {
    const addresses: Promise<Address>[] = []
    for (let index = start; index < end; index++) {
      addresses.push(this.address(index, type))
    }
    return Promise.all(addresses)
  }

  async scan() {
    // Scan all addresses with balance
    const MAX_INDEX = Config.MAX_SCAN_SIZE
    const size = Config.SCAN_BATCH_SIZE
    let index = 0

    let addresses: Address[] = []

    // Scan receive
    while (index < MAX_INDEX) {
      const receives = await this.addresses(
        index,
        index + size,
        AddressType.Receive
      )

      // Check for non-zero addresses
      const receivesUtxos = await Promise.all(receives.map((i) => i.utxos()))

      // Save to scannedAddress
      let filtered: Address[] = receives.filter((_, index) => {
        return receivesUtxos[index].length > 0
      })

      addresses = addresses.concat(filtered)

      if (filtered.length === 0) {
        console.log("finished scanning")
        break
      }

      index += size
    }

    index = 0

    // Scan change
    while (index < MAX_INDEX) {
      const changes = await this.addresses(
        index,
        index + size,
        AddressType.Change
      )

      // Check for non-zero addresses
      const changesUtxos = await Promise.all(changes.map((i) => i.utxos()))

      // Save to scannedAddress
      let filtered: Address[] = changes.filter((_, index) => {
        return changesUtxos[index].length > 0
      })

      addresses = addresses.concat(filtered)

      if (filtered.length === 0) {
        console.log("finished scanning")
        break
      }

      index += size
    }

    this.scannedAddresses = addresses
    return this.scannedAddresses
  }

  async send({
    recipient,
    amount,
    changeAddress,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendProps &
    SendCommonProps): Promise<Rpc.SubmitTransactionResponseMessage> {
    if (!recipient || !amount || !changeAddress) {
      throw new Error("params missing")
    }

    const addresses = await this.scan()
    const utxos = await this.utxosForAddresses(addresses)

    if (utxos.length === 0 || addresses.length === 0) {
      throw new Error("UTXO/address not found")
    }

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
      privateKeys: addresses.map((i) => i.privateKey),
      recipient,
      amount,
      changeAddress,
      fee: finalizedFee,
      priorityFee,
    })
  }

  async sendAll({
    recipient,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendCommonProps) {
    if (!recipient) {
      throw new Error("params missing")
    }

    const addresses = await this.scan()
    const utxos = await this.utxosForAddresses(addresses)
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
      privateKeys: addresses.map((i) => i.privateKey),
      recipient,
      amount: amountAfterFee,
      changeAddress: recipient,
      fee: finalizedFee,
      priorityFee,
    })
  }

  async compound(destination?: Address | string) {
    // If not set, default compound to the first address
    let to = destination?.toString()
    if (!to) {
      to = (await this.address()).toString()
    }

    return this.sendAll({
      recipient: to,
    })
  }

  async balance() {
    const addresses = await this.scan()
    return this.balanceForAddresses(addresses)
  }

  async utxos() {
    const addresses = await this.scan()
    return this.utxosForAddresses(addresses)
  }

  private async balanceForAddresses(addresses: Address[]) {
    return this.clientProvider
      .getBalancesByAddresses({
        addresses: addresses.map((i) => i.toString()),
      })
      .then((resp) => {
        return resp.entries.reduce((acc, item) => {
          return BigInt(acc) + BigInt(item.balance)
        }, BigInt(0))
      })
  }

  private async utxosForAddresses(addresses: Address[]) {
    return this.clientProvider
      .getUtxosByAddresses({
        addresses: addresses.map((i) => i.toString()),
      })
      .then((resp) => resp.entries)
  }
}
