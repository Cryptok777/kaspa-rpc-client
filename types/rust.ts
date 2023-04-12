export namespace Rust {
  export interface Transaction {
    inputs: Input[]
    outputs: Output[]
  }

  export interface Input {
    previousOutpoint: Outpoint
    signatureScript: number[]
    sequence: bigint
    sigOpCount: number
  }

  export interface Outpoint {
    transactionId: string
    index: number
  }

  export interface Output {
    value: bigint
    scriptPublicKey: ScriptPublicKey
  }

  export interface ScriptPublicKey {
    version: number
    script: number[]
  }

  export interface UTXO {
    address: string
    outpoint: Outpoint | undefined
    utxoEntry: UTXOEntry | undefined
  }

  export interface UTXOEntry {
    amount: bigint
    scriptPublicKey: ScriptPublicKey | undefined
    blockDaaScore: bigint
    isCoinbase: boolean
  }
}
