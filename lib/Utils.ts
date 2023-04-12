import _ from "lodash"
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
import {
  RPC as Rpc,
  Rust,
  SendCommonProps,
  SendOutputProps,
} from "../types/custom-types"
import { Config } from "./Wallet"
import {
  CreateTransactionProps,
  SendTransactionProps,
} from "../types/custom-types"

/**
 * This class provides helper funcitons that can be used acorss the library
 */
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

  /**
   * `estimateFee` calls `minimumTransactionFee` in WASM js to calculate the minimum fee
   * in order to send `amount` to `recepient`, given the available `utxos`
   */
  static async estimateFee({
    utxos,
    outputs,
  }: {
    utxos: Rpc.UtxosByAddressesEntry[]
    outputs: SendOutputProps[]
  }): Promise<bigint> {
    const rustUtxos = Utils.convertGRpcUtxosToRustUtxos(utxos)
    const utxoSet = UtxoSet.from({ entries: rustUtxos })
    const amount = Utils.getOutputSum(outputs)

    const utxoSelection = await utxoSet.select(
      BigInt(amount),
      UtxoOrdering.AscendingDaaScore
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

    const payments = outputs.map(
      (i) =>
        new PaymentOutput(
          new RustAddress(i.recipient.toString()),
          BigInt(i.amount)
        )
    )

    const tx = new Transaction({
      inputs,
      outputs: new PaymentOutputs(payments),
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

  /**
   * `createTransaction` returns a `MutableTransaction` object from WASM js, which can be used to sign,
   * by calling `Utils.signTransaction`.
   *
   * You can call `tx.toRpcTransaction()`, which converts it to RPC object which can
   * be used for Rust's wRPC `submitTransaction` endpoint.
   *
   * If you want to submit the
   * `MutableTransaction` object to gRPC endpoint, you need to call `Utils.convertRustTransactionToGRpcTransaction`
   */
  static async createTransaction({
    utxoSet,
    outputs,
    changeAddress,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: CreateTransactionProps): Promise<MutableTransaction> {
    const totalAmount =
      Utils.getOutputSum(outputs) + BigInt(fee) + BigInt(priorityFee)
    const utxoSelection = await utxoSet.select(
      totalAmount,
      UtxoOrdering.AscendingDaaScore
    )

    console.log(utxoSelection.totalAmount, utxoSelection.amount)

    // Balance validation
    if (utxoSelection.totalAmount < utxoSelection.amount) {
      throw new Error("Not enough balance from UTXO set")
    }

    // Build output
    const payments = outputs.map(
      (i) =>
        new PaymentOutput(
          new RustAddress(i.recipient.toString()),
          BigInt(i.amount)
        )
    )

    return createTransaction(
      utxoSelection,
      new PaymentOutputs(payments),
      new RustAddress(changeAddress.toString()),
      priorityFee
    )
  }

  /**
   * `signTransaction` calls `signTransaction` in WASM js to sign the `MutableTransaction`
   * object given an array of privateKeys
   */
  static signTransaction(tx: MutableTransaction, privateKeys: PrivateKey[]) {
    return signTransaction(tx, privateKeys, true)
  }

  static async sendTransaction({
    clientProvider,
    utxos,
    privateKeys,
    outputs,
    changeAddress,
    fee = Config.DEFAULT_FEE,
    priorityFee = 0,
  }: SendCommonProps &
    SendTransactionProps): Promise<Rpc.SubmitTransactionResponseMessage> {
    if (utxos.length === 0) {
      throw new Error("No UXTO to spend")
    }

    const rustUtxos = this.convertGRpcUtxosToRustUtxos(utxos)
    const utxoSet = UtxoSet.from({ entries: rustUtxos })

    // Estimate fee if not passed
    let finalizedFee = fee
    if (fee === Config.DEFAULT_FEE) {
      finalizedFee = await this.estimateFee({
        utxos,
        outputs,
      })
    }
    console.log("finalizedFee", finalizedFee)

    const mutableTransaction = await this.createTransaction({
      utxoSet,
      outputs,
      changeAddress,
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

  static getUtxosSum(utxos: Rpc.UtxosByAddressesEntry[]) {
    return utxos.reduce((acc, item) => {
      if (!item.utxoEntry?.amount) return acc
      return BigInt(acc) + BigInt(item.utxoEntry.amount)
    }, BigInt(0))
  }

  static getOutputSum(outputs: SendOutputProps[]) {
    return outputs.reduce(
      (acc, item) => BigInt(acc) + BigInt(item.amount || 0),
      BigInt(0)
    )
  }
}
