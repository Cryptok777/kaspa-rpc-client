import {
  Mnemonic as RustMnemonic,
  XPrv,
  XPublicKey,
  XPrivateKey,
  UtxoSet,
  Address as RustAddress,
  createTransaction,
  PaymentOutput,
  PaymentOutputs,
  UtxoOrdering,
  signTransaction,
  PrivateKey,
  MutableTransaction,
  SelectionContext,
  minimumTransactionFee,
  Transaction,
  NetworkType,
  TransactionInput,
  UtxoEntry,
  UtxoEntryReference,
  calculateTransactionMass,
} from "../wasm/kaspa_wasm"
import { RPC as Rpc, Rust } from "../types/custom-types"
import { ClientProvider } from "./ClientProvider"
import { util } from "prettier"

export const Config = {
  // Reserved fee, if the actual fee is lower,
  // remaining will be sent to change address
  DEFAULT_FEE: 0n,
  DEFAULT_COMPOUND_FEE: 1000000n,
  SCAN_BATCH_SIZE: 50,
}

export enum AddressType {
  Receive = 0,
  Change = 1,
}

interface SendTransactionProps {
  utxos: Rpc.UtxosByAddressesEntry[]
  privateKeys: PrivateKey[]
  clientProvider: ClientProvider
}

interface SendProps {
  changeAddress: string | Address
  amount: bigint
}

interface SendCommonProps {
  recipient: string | Address
  fee?: bigint
  priorityFee?: number
}

interface CreateTransactionProps {
  utxoSet: UtxoSet
  recipient: string | Address
  changeAddress: string | Address
  amount: bigint
  fee?: bigint
  priorityFee?: number
}

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
    const rustUtxos = Util.convertGRpcUtxosToRustUtxos(utxos)
    const utxoSet = UtxoSet.from({ entries: rustUtxos })

    const balance = await this.balance()

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Util.estimateFee({
        utxoSet,
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
    return Util.sendTransaction({
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
    const wallet = new HDWallet(clientProvider)
    const xPrv = new XPrv(new RustMnemonic(phrase).toSeed(""))
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet.account(index)
  }

  static fromSeed(
    clientProvider: ClientProvider,
    seed: string,
    index: bigint = 0n
  ) {
    const wallet = new HDWallet(clientProvider)
    const xPrv = new XPrv(seed)
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet.account(index)
  }

  static fromPrivateKey(
    clientProvider: ClientProvider,
    xPrv: string,
    index: bigint = 0n
  ) {
    const wallet = new HDWallet(clientProvider)
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
    const MAX_INDEX = 5000
    let index = 0
    const size = Config.SCAN_BATCH_SIZE

    let addresses: Address[] = []

    while (index < MAX_INDEX) {
      const receives = await this.addresses(
        index,
        index + size,
        AddressType.Receive
      )
      const changes = await this.addresses(
        index,
        index + size,
        AddressType.Change
      )

      // Check for non-zero addresses
      const receivesUtxos = await Promise.all(receives.map((i) => i.utxos()))
      const changesUtxos = await Promise.all(changes.map((i) => i.utxos()))

      // Save to scannedAddress
      let filtered: Address[] = []

      filtered = filtered.concat(
        receives.filter((_, index) => {
          return receivesUtxos[index].length > 0
        })
      )
      filtered = filtered.concat(
        changes.filter((_, index) => {
          return changesUtxos[index].length > 0
        })
      )

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

    const utxos = await this.utxos()
    const addresses = await this.scan()

    if (!utxos || !addresses) {
      throw new Error("UTXO/address not found")
    }

    return Util.sendTransaction({
      clientProvider: this.clientProvider,
      utxos,
      privateKeys: addresses.map((i) => i.privateKey),
      recipient,
      amount,
      changeAddress,
      fee,
      priorityFee,
    })
  }

  async sendAll({
    recipient,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendCommonProps) {
    const utxos = await this.utxos()
    const rustUtxos = Util.convertGRpcUtxosToRustUtxos(utxos)
    const utxoSet = UtxoSet.from({ entries: rustUtxos })

    const balance = await this.balance()

    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await Util.estimateFee({
        utxoSet,
        recipient,
        amount: balance,
      })
    }

    const amountAfterFee = balance - finalizedFee - BigInt(priorityFee)

    return this.send({
      recipient,
      amount: amountAfterFee,
      changeAddress: recipient,
      fee,
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

  async utxos() {
    const addresses = await this.scan()
    return this.clientProvider
      .getUtxosByAddresses({
        addresses: addresses.map((i) => i.toString()),
      })
      .then((resp) => resp.entries)
  }
}

export class HDWallet {
  private clientProvider: ClientProvider
  private root: string

  constructor(clientProvider: ClientProvider) {
    this.clientProvider = clientProvider
    const xPrv = new XPrv(RustMnemonic.random().toSeed(""))
    this.root = xPrv.intoString("xprv")
  }

  static fromPhrase(clientProvider: ClientProvider, phrase: string) {
    const wallet = new HDWallet(clientProvider)
    const xPrv = new XPrv(new RustMnemonic(phrase).toSeed(""))
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet
  }

  static fromSeed(clientProvider: ClientProvider, seed: string) {
    const wallet = new HDWallet(clientProvider)
    const xPrv = new XPrv(seed)
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet
  }

  static fromPrivateKey(clientProvider: ClientProvider, xPrv: string) {
    const wallet = new HDWallet(clientProvider)
    wallet.setRoot(xPrv)
    return wallet
  }

  setRoot(xPrv: string) {
    this.root = xPrv
  }

  async account(index: bigint = 0n) {
    const xPublicKey = await Util.getXPublicKey(this.root, index)
    const xPrivateKey = await Util.getXPrivateKey(this.root, index)

    return new Account(this.clientProvider, index, xPublicKey, xPrivateKey)
  }
}

export class Util {
  static byteArrayToHexString(byteArray: number[]) {
    return byteArray.map((byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  static hexStringToByteArray(hexStr?: string) {
    const hexChunks = hexStr?.match(/.{1,2}/g)
    const byteArray = hexChunks?.map((chunk) => parseInt(chunk, 16))
    return byteArray
  }

  static convertGRpcUtxosToRustUtxos(
    utxos: Rpc.UtxosByAddressesEntry[]
  ): Rust.UTXO[] {
    return utxos.map((entry) => {
      return {
        ...entry,
        utxoEntry: entry.utxoEntry && {
          ...entry.utxoEntry,
          amount: BigInt(entry.utxoEntry.amount.toString()),
          blockDaaScore: BigInt(entry.utxoEntry.blockDaaScore.toString()),
          isCoinbase: entry.utxoEntry?.isCoinbase === true,
          scriptPublicKey: {
            version: entry.utxoEntry.scriptPublicKey?.version || 0,
            script:
              this.hexStringToByteArray(
                entry.utxoEntry?.scriptPublicKey?.scriptPublicKey
              ) || [],
          },
        },
      }
    })
  }

  static convertRustTransactionToGRpcTransaction(
    transaction: Rust.Transaction
  ): Rpc.RpcTransaction {
    return {
      ...transaction,
      inputs: transaction.inputs.map((input) => {
        return {
          ...input,
          signatureScript: Util.byteArrayToHexString(input.signatureScript),
          verboseData: undefined,
        }
      }),
      outputs: transaction.outputs.map((output) => {
        return {
          scriptPublicKey: {
            version: output.scriptPublicKey.version,
            scriptPublicKey: Util.byteArrayToHexString(
              output.scriptPublicKey.script
            ),
          },
          amount: output.value,
          verboseData: undefined,
        }
      }),
      subnetworkId: "0000000000000000000000000000000000000000",
      payload: "",
      verboseData: undefined,
      version: 0,
      lockTime: 0n,
      gas: 0n,
    }
  }

  static async getXPublicKey(xprv: string, accountIndex: bigint) {
    return await XPublicKey.fromXPrv(xprv, false, accountIndex)
  }

  static async getXPrivateKey(xprv: string, accountIndex: bigint) {
    return new XPrivateKey(xprv, false, accountIndex)
  }

  static async estimateFee({
    utxoSet,
    recipient,
    amount,
  }: {
    utxoSet: UtxoSet
    recipient: string | Address
    amount: bigint
  }): Promise<bigint> {
    const utxoSelection = await utxoSet.select(
      BigInt(amount),
      UtxoOrdering.AscendingAmount
    )

    const inputs = utxoSelection.utxos.map(
      (utxo: UtxoEntryReference, index: number) => {
        return new TransactionInput({
          previousOutpoint: utxo.data.outpoint,
          signatureScript: [],
          sequence: index,
          sigOpCount: 0,
        })
      }
    )

    const payment = new PaymentOutput(
      new RustAddress(recipient.toString()),
      amount
    )
    const outputs = new PaymentOutputs([payment])

    const tx = new Transaction({
      inputs,
      outputs,
      lockTime: 0,
      subnetworkId: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      version: 0,
      gas: 0,
      payload: [],
    })

    const estimatedFee = minimumTransactionFee(tx, NetworkType.Mainnet)

    // There's a bug in utxoSelection.utxos which resulted in missing data, therefore lower estimated fee
    return estimatedFee * BigInt(2)
  }

  static async createTransaction({
    utxoSet,
    recipient,
    amount,
    changeAddress,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: CreateTransactionProps): Promise<MutableTransaction> {
    const totalAmount = BigInt(amount) + BigInt(fee) + BigInt(priorityFee)
    const utxoSelection = await utxoSet.select(
      totalAmount,
      UtxoOrdering.AscendingAmount
    )

    console.log(utxoSelection.totalAmount, utxoSelection.amount)

    // Balance validation
    if (utxoSelection.totalAmount < utxoSelection.amount) {
      throw new Error("Not enough balance from UTXO set")
    }

    // Build output
    const payment = new PaymentOutput(
      new RustAddress(recipient.toString()),
      amount
    )
    const outputs = new PaymentOutputs([payment])

    return createTransaction(
      utxoSelection,
      outputs,
      new RustAddress(changeAddress.toString()),
      priorityFee
    )
  }

  static signTransaction(tx: MutableTransaction, privateKeys: PrivateKey[]) {
    return signTransaction(tx, privateKeys, true)
  }

  static async sendTransaction({
    clientProvider,
    utxos,
    privateKeys,
    recipient,
    amount,
    changeAddress,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendProps &
    SendCommonProps &
    SendTransactionProps): Promise<Rpc.SubmitTransactionResponseMessage> {
    const rustUtxos = Util.convertGRpcUtxosToRustUtxos(utxos)
    const utxoSet = UtxoSet.from({ entries: rustUtxos })

    // Estimate fee if not passed
    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await this.estimateFee({
        utxoSet,
        recipient,
        amount,
      })
    }
    console.log("finalizedFee", finalizedFee)

    const mutableTransaction = await Util.createTransaction({
      utxoSet,
      recipient,
      changeAddress,
      amount,
      fee: finalizedFee,
      priorityFee,
    })

    const signedTx = Util.signTransaction(mutableTransaction, privateKeys)

    const rpcTx = Util.convertRustTransactionToGRpcTransaction(
      signedTx.toRpcTransaction() as Rust.Transaction
    )

    const tx = await clientProvider.submitTransaction({
      transaction: rpcTx,
      allowOrphan: false,
    })

    return tx
  }
}
