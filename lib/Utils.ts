import {
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
  minimumTransactionFee,
  Transaction,
  NetworkType,
  TransactionInput,
  UtxoEntryReference,
} from "../wasm/kaspa_wasm"
import { RPC as Rpc, Rust } from "../types/custom-types"
import { Address } from "./Address"
import { Config } from "./Wallet"
import {
  CreateTransactionProps,
  SendTransactionProps,
  SendProps,
  SendCommonProps,
} from "../types/custom-types"

export class Utils {
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
          signatureScript: this.byteArrayToHexString(input.signatureScript),
          verboseData: undefined,
        }
      }),
      outputs: transaction.outputs.map((output) => {
        return {
          scriptPublicKey: {
            version: output.scriptPublicKey.version,
            scriptPublicKey: this.byteArrayToHexString(
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
    const rustUtxos = this.convertGRpcUtxosToRustUtxos(utxos)
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

    const mutableTransaction = await this.createTransaction({
      utxoSet,
      recipient,
      changeAddress,
      amount,
      fee: finalizedFee,
      priorityFee,
    })

    const signedTx = this.signTransaction(mutableTransaction, privateKeys)

    const rpcTx = this.convertRustTransactionToGRpcTransaction(
      signedTx.toRpcTransaction() as Rust.Transaction
    )

    const tx = await clientProvider.submitTransaction({
      transaction: rpcTx,
      allowOrphan: false,
    })

    return tx
  }
}
