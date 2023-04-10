export namespace Rust {
  interface Transaction {
    inputs: Input[]
    outputs: Output[]
  }

  interface Input {
    previousOutpoint: Outpoint
    signatureScript: number[]
    sequence: bigint
    sigOpCount: number
  }

  interface Outpoint {
    transactionId: string
    index: number
  }

  interface Output {
    value: bigint
    scriptPublicKey: ScriptPublicKey
  }

  interface ScriptPublicKey {
    version: number
    script: number[]
  }

  interface UTXO {
    address: string
    outpoint: Outpoint | undefined
    utxoEntry: UTXOEntry | undefined
  }

  interface UTXOEntry {
    amount: bigint
    scriptPublicKey: ScriptPublicKey | undefined
    blockDaaScore: bigint
    isCoinbase: boolean
  }
}
