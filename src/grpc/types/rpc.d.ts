//([^\n \t].*) (.*) = \d{1,};
//$2: $1;

export declare type bytes = string //base64 encoded string

export namespace RPC {
  interface Error {
    errorCode?: number
    message: string
  }

  interface UTXOsByAddressesResponse {
    entries: UTXOsByAddressesEntry[]
    error: Error
  }

  interface UTXOsByAddressesEntry {
    address: string
    outpoint: Outpoint
    utxoEntry: UTXOEntry
    transaction: Transaction
    isCoinbase: boolean
  }

  interface Outpoint {
    transactionId: string
    index: number
  }

  interface ScriptPublicKey {
    version: number
    scriptPublicKey: string
  }

  interface UTXOEntry {
    amount: number
    scriptPublicKey: ScriptPublicKey
    blockBlueScore: number
    //blockDaaScore: number;
    isCoinbase: boolean
  }

  interface SubmitTransactionRequest {
    transaction: Transaction
    allowOrphan: boolean
  }

  interface SubmitTransactionResponse {
    transactionId: string
    error: Error
  }

  interface TransactionId {
    bytes: bytes
  }

  interface Transaction {
    version: number
    inputs: TransactionInput[]
    outputs: TransactionOutput[]
    lockTime: number
    subnetworkId: string
    gas?: number
    payloadHash?: string
    payload?: string
    fee: number
  }
  interface TransactionInput {
    previousOutpoint: Outpoint
    signatureScript: string
    sequence: number
    sigOpCount: number
    verboseData: TransactionInputVerboseData
  }

  interface TransactionInputVerboseData {
    transactionId: string
    hash: string
    mass: number
    blockHash: string
    blockTime: number
  }

  interface TransactionOutput {
    amount: number
    scriptPublicKey: ScriptPublicKey
  }

  interface TransactionsByAddressesResponse {
    lasBlockScanned: string
    transactions: TransactionVerboseData[]
    error: Error
  }

  interface TransactionVerboseData {
    txId: string
    hash: string
    size: number
    version: number
    lockTime: number
    subnetworkId: string
    gas: number
    payloadHash: string
    payload: string
    transactionVerboseInputs: TransactionVerboseInput[]
    transactionVerboseOutputs: TransactionVerboseOutput[]
    blockHash: string
    time: number
    blockTime: number
  }

  interface TransactionVerboseInput {
    txId: string
    outputIndex: number
    scriptSig: ScriptSig
    sequence: number
  }

  interface ScriptSig {
    asm: string
    hex: string
  }

  interface TransactionVerboseOutput {
    value: number
    index: number
    scriptPubKey: ScriptPubKeyResult
  }

  interface ScriptPubKeyResult {
    asm: string
    hex: string
    type: string
    address: string
  }

  interface BlockResponse {
    blockHash: string
    blockVerboseData: BlockVerboseData
    error: Error
  }

  interface BlockVerboseData {
    hash: string
    version: number
    versionHex: string
    hashMerkleRoot: string
    acceptedIDMerkleRoot: string
    utxoCommitment: string
    transactionVerboseData: TransactionVerboseData[]
    time: number
    nonce: number
    bits: string
    difficulty: number
    parentHashes: string[]
    selectedParentHash: string
    transactionIDs: string[]
  }

  /*
	###################################################
	###################################################
	###################################################
	*/
  interface SubPromise<T> extends Promise<T> {
    uid: string
  }

  interface NotifyChainChangedResponse {
    error: Error
  }

  interface NotifyBlockAddedResponse {
    error: Error
  }

  interface BlockAddedNotification {
    block: BlockMessage
  }

  interface BlockMessage {
    header: BlockHeaderMessage
    transactions: Transaction[]
  }

  interface BlockHeaderMessage {
    version: number
    parents: BlockLevelParents[]
    hashMerkleRoot: bytes
    acceptedIdMerkleRoot: bytes
    utxoCommitment: bytes
    timestamp: number
    bits: number
    nonce: number
    daaScore: number
    blueWork: number
    pruningPoint: string
    blueScore: number
  }

  interface BlockLevelParents {
    parentHashes: string[]
  }

  interface ChainChangedNotification {
    removedChainBlockHashes: string[]
    addedChainBlocks: ChainBlock[]
  }

  interface ChainBlock {
    hash: string
    acceptedBlocks: AcceptedBlock[]
  }

  interface AcceptedBlock {
    hash: string
    acceptedTxIds: string[]
  }

  interface NotifyVirtualSelectedParentBlueScoreChangedResponse {
    error: Error
  }

  interface VirtualSelectedParentBlueScoreResponse {
    blueScore: number
    error: Error
  }

  interface VirtualSelectedParentBlueScoreChangedNotification {
    virtualSelectedParentBlueScore: number
  }

  interface VirtualDaaScoreChangedNotification {
    virtualDaaScore: number
  }

  interface NotifyVirtualDaaScoreChangedResponse {
    error: Error
  }

  interface NotifyUtxosChangedResponse {
    error: Error
  }

  interface UtxosChangedNotification {
    added: UTXOsByAddressesEntry[]
    removed: UTXOsByAddressesEntry[]
  }

  interface GetBlockDagInfoResponse {
    networkName: string
    blockCount: number
    headerCount: number
    tipHashes: string[]
    difficulty: number
    pastMedianTime: number
    virtualParentHashes: string[]
    pruningPointHash: string
    virtualDaaScore: number
    error: Error
  }

  interface GetInfoResponse {
    isSynced: boolean
    isUtxoIndexed: boolean
  }

  declare type callback<T> = (result: T) => void
}

export interface IRPC {
  // RPC
  getBlock(
    blockHash: string,
    includeTransactions: boolean = true
  ): Promise<RPC.BlockResponse>
  getTransactionsByAddresses(
    startingBlockHash: string,
    addresses: string[]
  ): Promise<RPC.TransactionsByAddressesResponse>
  getUtxosByAddresses(
    addresses: string[]
  ): Promise<RPC.UTXOsByAddressesResponse>
  submitTransaction(
    tx: RPC.SubmitTransactionRequest
  ): Promise<RPC.SubmitTransactionResponse>
  getVirtualSelectedParentBlueScore(): Promise<RPC.VirtualSelectedParentBlueScoreResponse>
  getBlockDagInfo(): Promise<RPC.GetBlockDagInfoResponse>
  getInfoRequest(): Promise<RPC.GetInfoResponse>

  // Listener
  subscribeChainChanged(
    callback: Rpc.callback<Rpc.ChainChangedNotification>
  ): RPC.SubPromise<RPC.NotifyChainChangedResponse>
  subscribeBlockAdded(
    callback: Rpc.callback<Rpc.BlockAddedNotification>
  ): RPC.SubPromise<RPC.NotifyBlockAddedResponse>
  subscribeVirtualSelectedParentBlueScoreChanged(
    callback: RPC.callback<Rpc.VirtualSelectedParentBlueScoreChangedNotification>
  ): RPC.SubPromise<RPC.NotifyVirtualSelectedParentBlueScoreChangedResponse>
  subscribeVirtualDaaScoreChanged(
    callback: RPC.callback<Rpc.VirtualDaaScoreChangedNotification>
  ): RPC.SubPromise<RPC.NotifyVirtualDaaScoreChangedResponse>
  subscribeUtxosChanged(
    addresses: string[],
    callback: Rpc.callback<Rpc.UtxosChangedNotification>
  ): RPC.SubPromise<RPC.NotifyUtxosChangedResponse>
  unSubscribeUtxosChanged(uid: string = "")
  unSubscribe(eventName: string, uid: string = "")

  // Common
  request?(method: string, data: any)

  onConnect(cb: Function): void
  onDisconnect(cb: Function): void

  disconnect()
  connect()
}
