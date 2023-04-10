export namespace RPC {
  /**
   * RPC-related types. Request messages, response messages, and dependant types.
   *
   * Clients are expected to build RequestMessages and wrap them in KaspadMessage. (see messages.proto)
   *
   * Having received a RequestMessage, (wrapped in a KaspadMessage) the RPC server will respond with a
   * ResponseMessage (likewise wrapped in a KaspadMessage) respective to the original RequestMessage.
   *
   * **IMPORTANT:** This API is a work in progress and is subject to break between versions.
   */

  /**
   * RPCError represents a generic non-internal error.
   *
   * Receivers of any ResponseMessage are expected to check whether its error field is not null.
   */
  export interface RPCError {
    message: string
  }

  export interface RpcBlock {
    header: RpcBlockHeader | undefined
    transactions: RpcTransaction[]
    verboseData: RpcBlockVerboseData | undefined
  }

  export interface RpcBlockHeader {
    version: number
    parents: RpcBlockLevelParents[]
    hashMerkleRoot: string
    acceptedIdMerkleRoot: string
    utxoCommitment: string
    timestamp: bigint
    bits: number
    nonce: bigint
    daaScore: bigint
    blueWork: string
    pruningPoint: string
    blueScore: bigint
  }

  export interface RpcBlockLevelParents {
    parentHashes: string[]
  }

  export interface RpcBlockVerboseData {
    hash: string
    difficulty: number
    selectedParentHash: string
    transactionIds: string[]
    isHeaderOnly: boolean
    blueScore: bigint
    childrenHashes: string[]
    mergeSetBluesHashes: string[]
    mergeSetRedsHashes: string[]
    isChainBlock: boolean
  }

  export interface RpcTransaction {
    version: number
    inputs: RpcTransactionInput[]
    outputs: RpcTransactionOutput[]
    lockTime: bigint
    subnetworkId: string
    gas: bigint
    payload: string
    verboseData: RpcTransactionVerboseData | undefined
  }

  export interface RpcTransactionInput {
    previousOutpoint: RpcOutpoint | undefined
    signatureScript: string
    sequence: bigint
    sigOpCount: number
    verboseData: RpcTransactionInputVerboseData | undefined
  }

  export interface RpcScriptPublicKey {
    version: number
    scriptPublicKey: string
  }

  export interface RpcTransactionOutput {
    amount: bigint
    scriptPublicKey: RpcScriptPublicKey | undefined
    verboseData: RpcTransactionOutputVerboseData | undefined
  }

  export interface RpcOutpoint {
    transactionId: string
    index: number
  }

  export interface RpcUtxoEntry {
    amount: bigint
    scriptPublicKey: RpcScriptPublicKey | undefined
    blockDaaScore: bigint
    isCoinbase: boolean
  }

  export interface RpcTransactionVerboseData {
    transactionId: string
    hash: string
    mass: bigint
    blockHash: string
    blockTime: bigint
  }

  export interface RpcTransactionInputVerboseData {}

  export interface RpcTransactionOutputVerboseData {
    scriptPublicKeyType: string
    scriptPublicKeyAddress: string
  }

  /**
   * GetCurrentNetworkRequestMessage requests the network kaspad is currently running against.
   *
   * Possible networks are: Mainnet, Testnet, Simnet, Devnet
   */
  export interface GetCurrentNetworkRequestMessage {}

  export interface GetCurrentNetworkResponseMessage {
    currentNetwork: string
    error: RPCError | undefined
  }

  /**
   * SubmitBlockRequestMessage requests to submit a block into the DAG.
   * Blocks are generally expected to have been generated using the getBlockTemplate call.
   *
   * See: GetBlockTemplateRequestMessage
   */
  export interface SubmitBlockRequestMessage {
    block: RpcBlock | undefined
    allowNonDAABlocks: boolean
  }

  export interface SubmitBlockResponseMessage {
    rejectReason: SubmitBlockResponseMessage_RejectReason
    error: RPCError | undefined
  }

  export enum SubmitBlockResponseMessage_RejectReason {
    NONE = 0,
    BLOCK_INVALID = 1,
    IS_IN_IBD = 2,
    UNRECOGNIZED = -1,
  }

  /**
   * GetBlockTemplateRequestMessage requests a current block template.
   * Callers are expected to solve the block template and submit it using the submitBlock call
   *
   * See: SubmitBlockRequestMessage
   */
  export interface GetBlockTemplateRequestMessage {
    /** Which kaspa address should the coinbase block reward transaction pay into */
    payAddress: string
    extraData: string
  }

  export interface GetBlockTemplateResponseMessage {
    block: RpcBlock | undefined
    /**
     * Whether kaspad thinks that it's synced.
     * Callers are discouraged (but not forbidden) from solving blocks when kaspad is not synced.
     * That is because when kaspad isn't in sync with the rest of the network there's a high
     * chance the block will never be accepted, thus the solving effort would have been wasted.
     */
    isSynced: boolean
    error: RPCError | undefined
  }

  /**
   * NotifyBlockAddedRequestMessage registers this connection for blockAdded notifications.
   *
   * See: BlockAddedNotificationMessage
   */
  export interface NotifyBlockAddedRequestMessage {}

  export interface NotifyBlockAddedResponseMessage {
    error: RPCError | undefined
  }

  /**
   * BlockAddedNotificationMessage is sent whenever a blocks has been added (NOT accepted)
   * into the DAG.
   *
   * See: NotifyBlockAddedRequestMessage
   */
  export interface BlockAddedNotificationMessage {
    block: RpcBlock | undefined
  }

  /**
   * GetPeerAddressesRequestMessage requests the list of known kaspad addresses in the
   * current network. (mainnet, testnet, etc.)
   */
  export interface GetPeerAddressesRequestMessage {}

  export interface GetPeerAddressesResponseMessage {
    addresses: GetPeerAddressesKnownAddressMessage[]
    bannedAddresses: GetPeerAddressesKnownAddressMessage[]
    error: RPCError | undefined
  }

  export interface GetPeerAddressesKnownAddressMessage {
    Addr: string
  }

  /**
   * GetSelectedTipHashRequestMessage requests the hash of the current virtual's
   * selected parent.
   */
  export interface GetSelectedTipHashRequestMessage {}

  export interface GetSelectedTipHashResponseMessage {
    selectedTipHash: string
    error: RPCError | undefined
  }

  /**
   * GetMempoolEntryRequestMessage requests information about a specific transaction
   * in the mempool.
   */
  export interface GetMempoolEntryRequestMessage {
    /** The transaction's TransactionID. */
    txId: string
    includeOrphanPool: boolean
    filterTransactionPool: boolean
  }

  export interface GetMempoolEntryResponseMessage {
    entry: MempoolEntry | undefined
    error: RPCError | undefined
  }

  /**
   * GetMempoolEntriesRequestMessage requests information about all the transactions
   * currently in the mempool.
   */
  export interface GetMempoolEntriesRequestMessage {
    includeOrphanPool: boolean
    filterTransactionPool: boolean
  }

  export interface GetMempoolEntriesResponseMessage {
    entries: MempoolEntry[]
    error: RPCError | undefined
  }

  export interface MempoolEntry {
    fee: bigint
    transaction: RpcTransaction | undefined
    isOrphan: boolean
  }

  /**
   * GetConnectedPeerInfoRequestMessage requests information about all the p2p peers
   * currently connected to this kaspad.
   */
  export interface GetConnectedPeerInfoRequestMessage {}

  export interface GetConnectedPeerInfoResponseMessage {
    infos: GetConnectedPeerInfoMessage[]
    error: RPCError | undefined
  }

  export interface GetConnectedPeerInfoMessage {
    id: string
    address: string
    /** How long did the last ping/pong exchange take */
    lastPingDuration: bigint
    /** Whether this kaspad initiated the connection */
    isOutbound: boolean
    timeOffset: bigint
    userAgent: string
    /** The protocol version that this peer claims to support */
    advertisedProtocolVersion: number
    /** The timestamp of when this peer connected to this kaspad */
    timeConnected: bigint
    /** Whether this peer is the IBD peer (if IBD is running) */
    isIbdPeer: boolean
  }

  /**
   * AddPeerRequestMessage adds a peer to kaspad's outgoing connection list.
   * This will, in most cases, result in kaspad connecting to said peer.
   */
  export interface AddPeerRequestMessage {
    address: string
    /** Whether to keep attempting to connect to this peer after disconnection */
    isPermanent: boolean
  }

  export interface AddPeerResponseMessage {
    error: RPCError | undefined
  }

  /** SubmitTransactionRequestMessage submits a transaction to the mempool */
  export interface SubmitTransactionRequestMessage {
    transaction: RpcTransaction | undefined
    allowOrphan: boolean
  }

  export interface SubmitTransactionResponseMessage {
    /** The transaction ID of the submitted transaction */
    transactionId: string
    error: RPCError | undefined
  }

  /**
   * NotifyVirtualSelectedParentChainChangedRequestMessage registers this connection for virtualSelectedParentChainChanged notifications.
   *
   * See: VirtualSelectedParentChainChangedNotificationMessage
   */
  export interface NotifyVirtualSelectedParentChainChangedRequestMessage {
    includeAcceptedTransactionIds: boolean
  }

  export interface NotifyVirtualSelectedParentChainChangedResponseMessage {
    error: RPCError | undefined
  }

  /**
   * VirtualSelectedParentChainChangedNotificationMessage is sent whenever the DAG's selected parent
   * chain had changed.
   *
   * See: NotifyVirtualSelectedParentChainChangedRequestMessage
   */
  export interface VirtualSelectedParentChainChangedNotificationMessage {
    /** The chain blocks that were removed, in high-to-low order */
    removedChainBlockHashes: string[]
    /** The chain blocks that were added, in low-to-high order */
    addedChainBlockHashes: string[]
    /** Will be filled only if `includeAcceptedTransactionIds = true` in the notify request. */
    acceptedTransactionIds: AcceptedTransactionIds[]
  }

  /** GetBlockRequestMessage requests information about a specific block */
  export interface GetBlockRequestMessage {
    /** The hash of the requested block */
    hash: string
    /** Whether to include transaction data in the response */
    includeTransactions: boolean
  }

  export interface GetBlockResponseMessage {
    block: RpcBlock | undefined
    error: RPCError | undefined
  }

  /**
   * GetSubnetworkRequestMessage requests information about a specific subnetwork
   *
   * Currently unimplemented
   */
  export interface GetSubnetworkRequestMessage {
    subnetworkId: string
  }

  export interface GetSubnetworkResponseMessage {
    gasLimit: bigint
    error: RPCError | undefined
  }

  /**
   * GetVirtualSelectedParentChainFromBlockRequestMessage requests the virtual selected
   * parent chain from some startHash to this kaspad's current virtual
   */
  export interface GetVirtualSelectedParentChainFromBlockRequestMessage {
    startHash: string
    includeAcceptedTransactionIds: boolean
  }

  export interface AcceptedTransactionIds {
    acceptingBlockHash: string
    acceptedTransactionIds: string[]
  }

  export interface GetVirtualSelectedParentChainFromBlockResponseMessage {
    /** The chain blocks that were removed, in high-to-low order */
    removedChainBlockHashes: string[]
    /** The chain blocks that were added, in low-to-high order */
    addedChainBlockHashes: string[]
    /**
     * The transactions accepted by each block in addedChainBlockHashes.
     * Will be filled only if `includeAcceptedTransactionIds = true` in the request.
     */
    acceptedTransactionIds: AcceptedTransactionIds[]
    error: RPCError | undefined
  }

  /**
   * GetBlocksRequestMessage requests blocks between a certain block lowHash up to this
   * kaspad's current virtual.
   */
  export interface GetBlocksRequestMessage {
    lowHash: string
    includeBlocks: boolean
    includeTransactions: boolean
  }

  export interface GetBlocksResponseMessage {
    blockHashes: string[]
    blocks: RpcBlock[]
    error: RPCError | undefined
  }

  /**
   * GetBlockCountRequestMessage requests the current number of blocks in this kaspad.
   * Note that this number may decrease as pruning occurs.
   */
  export interface GetBlockCountRequestMessage {}

  export interface GetBlockCountResponseMessage {
    blockCount: bigint
    headerCount: bigint
    error: RPCError | undefined
  }

  /**
   * GetBlockDagInfoRequestMessage requests general information about the current state
   * of this kaspad's DAG.
   */
  export interface GetBlockDagInfoRequestMessage {}

  export interface GetBlockDagInfoResponseMessage {
    networkName: string
    blockCount: bigint
    headerCount: bigint
    tipHashes: string[]
    difficulty: number
    pastMedianTime: bigint
    virtualParentHashes: string[]
    pruningPointHash: string
    virtualDaaScore: bigint
    error: RPCError | undefined
  }

  export interface ResolveFinalityConflictRequestMessage {
    finalityBlockHash: string
  }

  export interface ResolveFinalityConflictResponseMessage {
    error: RPCError | undefined
  }

  export interface NotifyFinalityConflictsRequestMessage {}

  export interface NotifyFinalityConflictsResponseMessage {
    error: RPCError | undefined
  }

  export interface FinalityConflictNotificationMessage {
    violatingBlockHash: string
  }

  export interface FinalityConflictResolvedNotificationMessage {
    finalityBlockHash: string
  }

  /** ShutDownRequestMessage shuts down this kaspad. */
  export interface ShutDownRequestMessage {}

  export interface ShutDownResponseMessage {
    error: RPCError | undefined
  }

  /**
   * GetHeadersRequestMessage requests headers between the given startHash and the
   * current virtual, up to the given limit.
   */
  export interface GetHeadersRequestMessage {
    startHash: string
    limit: bigint
    isAscending: boolean
  }

  export interface GetHeadersResponseMessage {
    headers: string[]
    error: RPCError | undefined
  }

  /**
   * NotifyUtxosChangedRequestMessage registers this connection for utxoChanged notifications
   * for the given addresses.
   *
   * This call is only available when this kaspad was started with `--utxoindex`
   *
   * See: UtxosChangedNotificationMessage
   */
  export interface NotifyUtxosChangedRequestMessage {
    /** Leave empty to get all updates */
    addresses: string[]
  }

  export interface NotifyUtxosChangedResponseMessage {
    error: RPCError | undefined
  }

  /**
   * UtxosChangedNotificationMessage is sent whenever the UTXO index had been updated.
   *
   * See: NotifyUtxosChangedRequestMessage
   */
  export interface UtxosChangedNotificationMessage {
    added: UtxosByAddressesEntry[]
    removed: UtxosByAddressesEntry[]
  }

  export interface UtxosByAddressesEntry {
    address: string
    outpoint: RpcOutpoint | undefined
    utxoEntry: RpcUtxoEntry | undefined
  }

  /**
   * StopNotifyingUtxosChangedRequestMessage unregisters this connection for utxoChanged notifications
   * for the given addresses.
   *
   * This call is only available when this kaspad was started with `--utxoindex`
   *
   * See: UtxosChangedNotificationMessage
   */
  export interface StopNotifyingUtxosChangedRequestMessage {
    addresses: string[]
  }

  export interface StopNotifyingUtxosChangedResponseMessage {
    error: RPCError | undefined
  }

  /**
   * GetUtxosByAddressesRequestMessage requests all current UTXOs for the given kaspad addresses
   *
   * This call is only available when this kaspad was started with `--utxoindex`
   */
  export interface GetUtxosByAddressesRequestMessage {
    addresses: string[]
  }

  export interface GetUtxosByAddressesResponseMessage {
    entries: UtxosByAddressesEntry[]
    error: RPCError | undefined
  }

  /**
   * GetBalanceByAddressRequest returns the total balance in unspent transactions towards a given address
   *
   * This call is only available when this kaspad was started with `--utxoindex`
   */
  export interface GetBalanceByAddressRequestMessage {
    address: string
  }

  export interface GetBalanceByAddressResponseMessage {
    balance: bigint
    error: RPCError | undefined
  }

  export interface GetBalancesByAddressesRequestMessage {
    addresses: string[]
  }

  export interface BalancesByAddressEntry {
    address: string
    balance: bigint
    error: RPCError | undefined
  }

  export interface GetBalancesByAddressesResponseMessage {
    entries: BalancesByAddressEntry[]
    error: RPCError | undefined
  }

  /**
   * GetVirtualSelectedParentBlueScoreRequestMessage requests the blue score of the current selected parent
   * of the virtual block.
   */
  export interface GetVirtualSelectedParentBlueScoreRequestMessage {}

  export interface GetVirtualSelectedParentBlueScoreResponseMessage {
    blueScore: bigint
    error: RPCError | undefined
  }

  /**
   * NotifyVirtualSelectedParentBlueScoreChangedRequestMessage registers this connection for
   * virtualSelectedParentBlueScoreChanged notifications.
   *
   * See: VirtualSelectedParentBlueScoreChangedNotificationMessage
   */
  export interface NotifyVirtualSelectedParentBlueScoreChangedRequestMessage {}

  export interface NotifyVirtualSelectedParentBlueScoreChangedResponseMessage {
    error: RPCError | undefined
  }

  /**
   * VirtualSelectedParentBlueScoreChangedNotificationMessage is sent whenever the blue score
   * of the virtual's selected parent changes.
   *
   * See NotifyVirtualSelectedParentBlueScoreChangedRequestMessage
   */
  export interface VirtualSelectedParentBlueScoreChangedNotificationMessage {
    virtualSelectedParentBlueScore: bigint
  }

  /**
   * NotifyVirtualDaaScoreChangedRequestMessage registers this connection for
   * virtualDaaScoreChanged notifications.
   *
   * See: VirtualDaaScoreChangedNotificationMessage
   */
  export interface NotifyVirtualDaaScoreChangedRequestMessage {}

  export interface NotifyVirtualDaaScoreChangedResponseMessage {
    error: RPCError | undefined
  }

  /**
   * VirtualDaaScoreChangedNotificationMessage is sent whenever the DAA score
   * of the virtual changes.
   *
   * See NotifyVirtualDaaScoreChangedRequestMessage
   */
  export interface VirtualDaaScoreChangedNotificationMessage {
    virtualDaaScore: bigint
  }

  /**
   * NotifyPruningPointUTXOSetOverrideRequestMessage registers this connection for
   * pruning point UTXO set override notifications.
   *
   * This call is only available when this kaspad was started with `--utxoindex`
   *
   * See: NotifyPruningPointUTXOSetOverrideResponseMessage
   */
  export interface NotifyPruningPointUTXOSetOverrideRequestMessage {}

  export interface NotifyPruningPointUTXOSetOverrideResponseMessage {
    error: RPCError | undefined
  }

  /**
   * PruningPointUTXOSetOverrideNotificationMessage is sent whenever the UTXO index
   * resets due to pruning point change via IBD.
   *
   * See NotifyPruningPointUTXOSetOverrideRequestMessage
   */
  export interface PruningPointUTXOSetOverrideNotificationMessage {}

  /**
   * StopNotifyingPruningPointUTXOSetOverrideRequestMessage unregisters this connection for
   * pruning point UTXO set override notifications.
   *
   * This call is only available when this kaspad was started with `--utxoindex`
   *
   * See: PruningPointUTXOSetOverrideNotificationMessage
   */
  export interface StopNotifyingPruningPointUTXOSetOverrideRequestMessage {}

  export interface StopNotifyingPruningPointUTXOSetOverrideResponseMessage {
    error: RPCError | undefined
  }

  /** BanRequestMessage bans the given ip. */
  export interface BanRequestMessage {
    ip: string
  }

  export interface BanResponseMessage {
    error: RPCError | undefined
  }

  /** UnbanRequestMessage unbans the given ip. */
  export interface UnbanRequestMessage {
    ip: string
  }

  export interface UnbanResponseMessage {
    error: RPCError | undefined
  }

  /** GetInfoRequestMessage returns info about the node. */
  export interface GetInfoRequestMessage {}

  export interface GetInfoResponseMessage {
    p2pId: string
    mempoolSize: bigint
    serverVersion: string
    isUtxoIndexed: boolean
    isSynced: boolean
    error: RPCError | undefined
  }

  export interface EstimateNetworkHashesPerSecondRequestMessage {
    windowSize: number
    startHash: string
  }

  export interface EstimateNetworkHashesPerSecondResponseMessage {
    networkHashesPerSecond: bigint
    error: RPCError | undefined
  }

  /**
   * NotifyNewBlockTemplateRequestMessage registers this connection for
   * NewBlockTemplate notifications.
   *
   * See: NewBlockTemplateNotificationMessage
   */
  export interface NotifyNewBlockTemplateRequestMessage {}

  export interface NotifyNewBlockTemplateResponseMessage {
    error: RPCError | undefined
  }

  /**
   * NewBlockTemplateNotificationMessage is sent whenever a new updated block template is
   * available for miners.
   *
   * See NotifyNewBlockTemplateRequestMessage
   */
  export interface NewBlockTemplateNotificationMessage {}

  export interface MempoolEntryByAddress {
    address: string
    sending: MempoolEntry[]
    receiving: MempoolEntry[]
  }

  export interface GetMempoolEntriesByAddressesRequestMessage {
    addresses: string[]
    includeOrphanPool: boolean
    filterTransactionPool: boolean
  }

  export interface GetMempoolEntriesByAddressesResponseMessage {
    entries: MempoolEntryByAddress[]
    error: RPCError | undefined
  }

  export interface GetCoinSupplyRequestMessage {}

  export interface GetCoinSupplyResponseMessage {
    /** note: this is a hard coded maxSupply, actual maxSupply is expected to deviate by upto -5%, but cannot be measured exactly. */
    maxSompi: bigint
    circulatingSompi: bigint
    error: RPCError | undefined
  }

  // Shared
  export interface SubPromise<T> extends Promise<T> {
    uid: string
  }

  export type callback<T> = (result: T) => void
}
