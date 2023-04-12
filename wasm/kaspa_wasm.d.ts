/* tslint:disable */
/* eslint-disable */
/**
* Present panic logs to the user
*/
export function show_panic_hook_logs(): void;
/**
* Initialize panic hook in browser mode
*/
export function init_popup_panic_hook(): void;
/**
* Initialize panic hook in console mode
*/
export function init_console_panic_hook(): void;
/**
* Deferred promise - an object that has `resolve()` and `reject()`
* functions that can be called outside of the promise body.
* @returns {Promise<any>}
*/
export function defer(): Promise<any>;
/**
* @param {any} workflow
* @param {any} modules
*/
export function init_workflow(workflow: any, modules: any): void;
/**
* @param {SelectionContext} utxo_selection
* @param {PaymentOutputs} outputs
* @param {Address} change_address
* @param {number | undefined} priority_fee
* @param {Uint8Array | undefined} payload
* @returns {MutableTransaction}
*/
export function createTransaction(utxo_selection: SelectionContext, outputs: PaymentOutputs, change_address: Address, priority_fee?: number, payload?: Uint8Array): MutableTransaction;
/**
* @param {MutableTransaction} mtx
* @param {Address} change_address
* @param {bigint | undefined} priority_fee
* @returns {boolean}
*/
export function adjustTransactionForFee(mtx: MutableTransaction, change_address: Address, priority_fee?: bigint): boolean;
/**
* Calculate the minimum transaction fee. Transaction fee is derived from the
* @param {Transaction} tx
* @param {number} network_type
* @returns {bigint}
*/
export function minimumTransactionFee(tx: Transaction, network_type: number): bigint;
/**
* Calculate transaction mass. Transaction mass is used in the fee calculation.
* @param {Transaction} tx
* @param {number} network_type
* @param {boolean} estimate_signature_mass
* @returns {bigint}
*/
export function calculateTransactionMass(tx: Transaction, network_type: number, estimate_signature_mass: boolean): bigint;
/**
* @returns {Keypair}
*/
export function generate_random_keypair_not_secure(): Keypair;
/**
* `signTransaction()` is a helper function to sign a transaction using a private key array or a signer array.
* @param {MutableTransaction} mtx
* @param {PrivateKey[] | Signer} signer
* @param {boolean} verify_sig
* @returns {MutableTransaction}
*/
export function signTransaction(mtx: MutableTransaction, signer: PrivateKey[] | Signer, verify_sig: boolean): MutableTransaction;
/**
* @param {any} script_hash
* @param {PrivateKey} privkey
* @returns {string}
*/
export function signScriptHash(script_hash: any, privkey: PrivateKey): string;
/**
* is_transaction_output_dust returns whether or not the passed transaction output
* amount is considered dust or not based on the configured minimum transaction
* relay fee.
*
* Dust is defined in terms of the minimum transaction relay fee. In particular,
* if the cost to the network to spend coins is more than 1/3 of the minimum
* transaction relay fee, it is considered dust.
*
* It is exposed by [MiningManager] for use by transaction generators and wallets.
* @param {TransactionOutput} transaction_output
* @returns {boolean}
*/
export function isTransactionOutputDust(transaction_output: TransactionOutput): boolean;
/**
* @param {string} text
* @param {string} password
* @returns {string}
*/
export function encrypt(text: string, password: string): string;
/**
* @param {string} text
* @param {string} password
* @returns {string}
*/
export function decrypt(text: string, password: string): string;
/**
* Supported languages.
*
* Presently only English is specified by the BIP39 standard
*/
export enum Language {
/**
* English is presently the only supported language
*/
  English = 0,
}
/**
*
*  Kaspa `Address` version (`PubKey`, `PubKey ECDSA`, `ScriptHash`)
*/
export enum AddressVersion {
/**
* PubKey addresses always have the version byte set to 0
*/
  PubKey = 0,
/**
* PubKey ECDSA addresses always have the version byte set to 1
*/
  PubKeyECDSA = 1,
/**
* ScriptHash addresses always have the version byte set to 8
*/
  ScriptHash = 8,
}
/**
* RPC protocol encoding: `Borsh` or `SerdeJson`
*/
export enum Encoding {
  Borsh = 0,
  SerdeJson = 1,
}
/**
* UtxoOrdering enum denotes UTXO sort order (`Unordered`, `AscendingAmount`, `AscendingDaaScore`)
*/
export enum UtxoOrdering {
  Unordered = 0,
  AscendingAmount = 1,
  AscendingDaaScore = 2,
}
/**
*/
export enum AccountKind {
  V0 = 0,
  Bip32 = 1,
  MultiSig = 2,
}
/**
*/
export enum NetworkType {
  Mainnet = 0,
  Testnet = 1,
}
/**
* Wallet `Account` data structure. An account is typically a single
* HD-key derivation (derived from a wallet or from an an external secret)
*/
export class Account {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  accountKind: number;
/**
*/
  readonly balance: bigint;
}
/**
* Kaspa `Address` struct that serializes to and from an address format string: `kaspa:qz0s...t8cv`.
*/
export class Address {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {string} address
*/
  constructor(address: string);
/**
* Convert an address to a string.
* @returns {string}
*/
  toString(): string;
/**
*/
  readonly payload: string;
/**
*/
  prefix: string;
/**
*/
  readonly version: string;
}
/**
*/
export class AddressGenerator {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  readonly currentAddress: Promise<Address>;
/**
*/
  readonly publicKey: string;
}
/**
*/
export class AddressGeneratorV0 {
  free(): void;
}
/**
*/
export class DerivationPath {
  free(): void;
/**
* @param {string} path
*/
  constructor(path: string);
/**
* Is this derivation path empty? (i.e. the root)
* @returns {boolean}
*/
  isEmpty(): boolean;
/**
* Get the count of [`ChildNumber`] values in this derivation path.
* @returns {number}
*/
  length(): number;
/**
* Get the parent [`DerivationPath`] for the current one.
*
* Returns `Undefined` if this is already the root path.
* @returns {DerivationPath | undefined}
*/
  parent(): DerivationPath | undefined;
/**
* Push a [`ChildNumber`] onto an existing derivation path.
* @param {number} child_number
* @param {boolean | undefined} hardened
*/
  push(child_number: number, hardened?: boolean): void;
/**
* @returns {string}
*/
  toString(): string;
}
/**
*/
export class Hash {
  free(): void;
/**
* @param {string} hex_str
*/
  constructor(hex_str: string);
/**
* @returns {string}
*/
  toString(): string;
}
/**
*/
export class Header {
  free(): void;
/**
* @param {number} version
* @param {Array<any>} parents_by_level_array
* @param {string} hash_merkle_root
* @param {string} accepted_id_merkle_root
* @param {string} utxo_commitment
* @param {bigint} timestamp
* @param {number} bits
* @param {bigint} nonce
* @param {bigint} daa_score
* @param {bigint} blue_work
* @param {bigint} blue_score
* @param {string} pruning_point
*/
  constructor(version: number, parents_by_level_array: Array<any>, hash_merkle_root: string, accepted_id_merkle_root: string, utxo_commitment: string, timestamp: bigint, bits: number, nonce: bigint, daa_score: bigint, blue_work: bigint, blue_score: bigint, pruning_point: string);
/**
* @returns {string}
*/
  calculateHash(): string;
}
/**
* Data structure that contains a secret and public keys.
*/
export class Keypair {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  readonly privateKey: PrivateKey;
/**
*/
  readonly publicKey: any;
/**
*/
  readonly xOnlyPublicKey: any;
}
/**
* BIP39 mnemonic phrases: sequences of words representing cryptographic keys.
*/
export class Mnemonic {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {string} phrase
* @param {number | undefined} language
*/
  constructor(phrase: string, language?: number);
/**
* @returns {Mnemonic}
*/
  static random(): Mnemonic;
/**
* @param {string} password
* @returns {string}
*/
  toSeed(password: string): string;
/**
*/
  entropy: string;
/**
*/
  phrase: string;
}
/**
*
* [`MultiplexerClient`] is an object meant to be used in WASM environment to
* process channel events.
*/
export class MultiplexerClient {
  free(): void;
/**
*/
  constructor();
/**
* @param {any} callback
*/
  setHandler(callback: any): void;
/**
* `removeHandler` must be called when releasing ReflectorClient
* to stop the background event processing task
*/
  removeHandler(): void;
/**
* @returns {Promise<void>}
*/
  stop(): Promise<void>;
}
/**
* Represents a generic mutable transaction
*/
export class MutableTransaction {
  free(): void;
/**
* @param {Transaction} tx
* @param {UtxoEntries} entries
*/
  constructor(tx: Transaction, entries: UtxoEntries);
/**
* @returns {string}
*/
  toJSON(): string;
/**
* @param {string} json
* @returns {MutableTransaction}
*/
  static fromJSON(json: string): MutableTransaction;
/**
* @returns {any}
*/
  getScriptHashes(): any;
/**
* @param {Array<any>} signatures
* @returns {any}
*/
  setSignatures(signatures: Array<any>): any;
/**
* @returns {any}
*/
  toRpcTransaction(): any;
/**
* UTXO entry data
*/
  entries: UtxoEntries;
/**
*/
  readonly id: string;
/**
*/
  readonly inputs: Array<any>;
/**
*/
  readonly outputs: Array<any>;
}
/**
*/
export class PaymentOutput {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {Address} address
* @param {bigint} amount
* @param {UtxoEntry | undefined} utxo_entry
*/
  constructor(address: Address, amount: bigint, utxo_entry?: UtxoEntry);
/**
*/
  address: Address;
/**
*/
  amount: bigint;
}
/**
*/
export class PaymentOutputs {
  free(): void;
/**
* @param {any} output_array
*/
  constructor(output_array: any);
}
/**
* Data structure that envelops a Private Key
*/
export class PrivateKey {
  free(): void;
/**
* @returns {string}
*/
  __getClassname(): string;
/**
* @param {string} key
*/
  constructor(key: string);
}
/**
* Kaspa RPC client
*/
export class RpcClient {
  free(): void;
/**
* Create a new RPC client with [`Encoding`] and a `url`.
* @param {number} encoding
* @param {string} url
*/
  constructor(encoding: number, url: string);
/**
* Connect to the Kaspa RPC server. This function starts a background
* task that connects and reconnects to the server if the connection
* is terminated.  Use [`disconnect()`] to terminate the connection.
* @returns {Promise<void>}
*/
  connect(): Promise<void>;
/**
* Disconnect from the Kaspa RPC server.
* @returns {Promise<void>}
*/
  disconnect(): Promise<void>;
/**
* Register a notification callback.
* @param {any} callback
* @returns {Promise<void>}
*/
  notify(callback: any): Promise<void>;
/**
* Subscription to DAA Score (test)
* @returns {Promise<void>}
*/
  subscribeDaaScore(): Promise<void>;
/**
* Unsubscribe from DAA Score (test)
* @returns {Promise<void>}
*/
  unsubscribeDaaScore(): Promise<void>;
/**
* Subscription to UTXOs Changed notifications
* @param {any} addresses
* @returns {Promise<void>}
*/
  subscribeUtxosChanged(addresses: any): Promise<void>;
/**
* Unsubscribe from DAA Score (test)
* @param {any} addresses
* @returns {Promise<void>}
*/
  unsubscribeUtxosChanged(addresses: any): Promise<void>;
/**
* @param {boolean} include_accepted_transaction_ids
* @returns {Promise<void>}
*/
  subscribeVirtualChainChanged(include_accepted_transaction_ids: boolean): Promise<void>;
/**
* @param {boolean} include_accepted_transaction_ids
* @returns {Promise<void>}
*/
  unsubscribeVirtualChainChanged(include_accepted_transaction_ids: boolean): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribeBlockAdded(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeBlockAdded(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribeFinalityConflict(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeFinalityConflict(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribeFinalityConflictResolved(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeFinalityConflictResolved(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribeSinkBlueScoreChanged(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeSinkBlueScoreChanged(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribeVirtualDaaScoreChanged(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeVirtualDaaScoreChanged(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribePruningPointUtxoSetOverride(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribePruningPointUtxoSetOverride(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  subscribeNewBlockTemplate(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeNewBlockTemplate(): Promise<void>;
/**
* @returns {Promise<any>}
*/
  getBlockCount(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getBlockDagInfo(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getCoinSupply(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getConnectedPeerInfo(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getInfo(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getPeerAddresses(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getProcessMetrics(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getSelectedTipHash(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  getSinkBlueScore(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  ping(): Promise<any>;
/**
* @returns {Promise<any>}
*/
  shutdown(): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  addPeer(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  ban(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  estimateNetworkHashesPerSecond(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getBalanceByAddress(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getBalancesByAddresses(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getBlock(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getBlocks(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getBlockTemplate(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getCurrentNetwork(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getHeaders(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getMempoolEntries(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getMempoolEntriesByAddresses(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getMempoolEntry(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getSubnetwork(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getVirtualChainFromBlock(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  resolveFinalityConflict(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  submitBlock(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  unban(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  submitTransaction(request: any): Promise<any>;
/**
* @param {any} request
* @returns {Promise<any>}
*/
  getUtxosByAddresses(request: any): Promise<any>;
}
/**
*
*  ScriptBuilder provides a facility for building custom scripts. It allows
* you to push opcodes, ints, and data while respecting canonical encoding. In
* general it does not ensure the script will execute correctly, however any
* data pushes which would exceed the maximum allowed script engine limits and
* are therefore guaranteed not to execute will not be pushed and will result in
* the Script function returning an error.
*/
export class ScriptBuilder {
  free(): void;
/**
* Get script bytes represented by a hex string.
* @returns {string}
*/
  script(): string;
/**
* Drains (empties) the script builder, returning the
* script bytes represented by a hex string.
* @returns {string}
*/
  drain(): string;
/**
* Pushes the passed opcode to the end of the script. The script will not
* be modified if pushing the opcode would cause the script to exceed the
* maximum allowed script engine size.
* @param {number} opcode
* @returns {ScriptBuilder}
*/
  addOp(opcode: number): ScriptBuilder;
/**
* @param {any} opcodes
* @returns {ScriptBuilder}
*/
  addOps(opcodes: any): ScriptBuilder;
/**
* AddData pushes the passed data to the end of the script. It automatically
* chooses canonical opcodes depending on the length of the data.
*
* A zero length buffer will lead to a push of empty data onto the stack (Op0 = OpFalse)
* and any push of data greater than [`MAX_SCRIPT_ELEMENT_SIZE`] will not modify
* the script since that is not allowed by the script engine.
*
* Also, the script will not be modified if pushing the data would cause the script to
* exceed the maximum allowed script engine size [`MAX_SCRIPTS_SIZE`].
* @param {any} data
* @returns {ScriptBuilder}
*/
  addData(data: any): ScriptBuilder;
/**
* @param {bigint} val
* @returns {ScriptBuilder}
*/
  addI64(val: bigint): ScriptBuilder;
/**
* @param {bigint} lock_time
* @returns {ScriptBuilder}
*/
  addLockTime(lock_time: bigint): ScriptBuilder;
/**
* @param {bigint} sequence
* @returns {ScriptBuilder}
*/
  addSequence(sequence: bigint): ScriptBuilder;
}
/**
* Represents a Kaspad ScriptPublicKey
*/
export class ScriptPublicKey {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {number} version
* @param {any} script
*/
  constructor(version: number, script: any);
/**
*/
  readonly script: string;
/**
*/
  version: number;
}
/**
* Result containing data produced by the `UtxoSet::select()` function
*/
export class SelectionContext {
  free(): void;
/**
*/
  amount: bigint;
/**
*/
  totalAmount: bigint;
/**
*/
  readonly utxos: Array<any>;
}
/**
* `Signer` is a type capable of signing transactions.
*/
export class Signer {
  free(): void;
/**
* @returns {string}
*/
  __getClassname(): string;
/**
* @param {PrivateKey[]} private_keys
*/
  constructor(private_keys: PrivateKey[]);
/**
* @param {MutableTransaction} mtx
* @param {boolean} verify_sig
* @returns {MutableTransaction}
*/
  signTransaction(mtx: MutableTransaction, verify_sig: boolean): MutableTransaction;
/**
*/
  verify: boolean;
}
/**
*/
export class State {
  free(): void;
/**
* @param {Header} header
*/
  constructor(header: Header);
/**
* @param {bigint} nonce
* @returns {Array<any>}
*/
  checkPow(nonce: bigint): Array<any>;
}
/**
* Wallet file storage interface
*/
export class Store {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  readonly filename: string;
}
/**
* Represents a Kaspa transaction
*/
export class Transaction {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Determines whether or not a transaction is a coinbase transaction. A coinbase
* transaction is a special transaction created by miners that distributes fees and block subsidy
* to the previous blocks' miners, and specifies the script_pub_key that will be used to pay the current
* miner in future blocks.
* @returns {boolean}
*/
  is_coinbase(): boolean;
/**
* Recompute and finalize the tx id based on updated tx fields
*/
  finalize(): void;
/**
* @param {any} js_value
*/
  constructor(js_value: any);
/**
*/
  gas: bigint;
/**
* Returns the transaction ID
*/
  readonly id: string;
/**
*/
  inputs: any;
/**
*/
  lock_time: bigint;
/**
*/
  outputs: any;
/**
*/
  payload: any;
/**
*/
  subnetworkId: any;
/**
*/
  version: number;
}
/**
* Represents a Kaspa transaction input
*/
export class TransactionInput {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {any} js_value
*/
  constructor(js_value: any);
/**
*/
  previousOutpoint: any;
/**
*/
  sequence: bigint;
/**
*/
  sigOpCount: number;
/**
*/
  signatureScript: any;
}
/**
* Represents a Kaspa transaction outpoint
*/
export class TransactionOutpoint {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {string} transaction_id
* @param {number} index
*/
  constructor(transaction_id: string, index: number);
/**
*/
  index: number;
/**
*/
  transactionId: string;
}
/**
* Represents a Kaspad transaction output
*/
export class TransactionOutput {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* TransactionOutput constructor
* @param {bigint} value
* @param {ScriptPublicKey} script_public_key
*/
  constructor(value: bigint, script_public_key: ScriptPublicKey);
/**
* @returns {boolean}
*/
  isDust(): boolean;
/**
*/
  scriptPublicKey: ScriptPublicKey;
/**
*/
  value: bigint;
}
/**
*/
export class TransactionOutputInner {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  scriptPublicKey: ScriptPublicKey;
/**
*/
  value: bigint;
}
/**
* Holds details about an individual transaction output in a utxo
* set such as whether or not it was contained in a coinbase tx, the daa
* score of the block that accepts the tx, its public key script, and how
* much it pays.
*/
export class TxUtxoEntry {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  amount: bigint;
/**
*/
  blockDaaScore: bigint;
/**
*/
  isCoinbase: boolean;
/**
*/
  scriptPublicKey: ScriptPublicKey;
}
/**
*/
export class TxUtxoEntryList {
  free(): void;
}
/**
*/
export class Uint192 {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {bigint} n
*/
  constructor(n: bigint);
/**
* @param {string} hex
* @returns {Uint192}
*/
  static fromHex(hex: string): Uint192;
/**
* @returns {bigint}
*/
  toBigInt(): bigint;
/**
*/
  readonly value: bigint;
}
/**
*/
export class Uint256 {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {bigint} n
*/
  constructor(n: bigint);
/**
* @param {string} hex
* @returns {Uint256}
*/
  static fromHex(hex: string): Uint256;
/**
* @returns {bigint}
*/
  toBigInt(): bigint;
/**
*/
  readonly value: bigint;
}
/**
*/
export class UtxoEntries {
  free(): void;
/**
* @param {any} js_value
*/
  constructor(js_value: any);
/**
*/
  items: any;
}
/**
*/
export class UtxoEntry {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  address?: Address;
/**
*/
  entry: TxUtxoEntry;
/**
*/
  outpoint: TransactionOutpoint;
}
/**
*/
export class UtxoEntryReference {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @returns {string}
*/
  __getClassname(): string;
/**
*/
  readonly data: UtxoEntry;
}
/**
* a collection of UTXO entries
*/
export class UtxoSet {
  free(): void;
/**
* @param {UtxoEntryReference} utxo_entry
*/
  insert(utxo_entry: UtxoEntryReference): void;
/**
* @param {bigint} transaction_amount
* @param {number} order
* @returns {Promise<SelectionContext>}
*/
  select(transaction_amount: bigint, order: number): Promise<SelectionContext>;
/**
* @param {any} js_value
* @returns {UtxoSet}
*/
  static from(js_value: any): UtxoSet;
}
/**
* `VirtualTransaction` envelops a collection of multiple related `kaspa_wallet_core::MutableTransaction` instances.
*/
export class VirtualTransaction {
  free(): void;
/**
* @param {SelectionContext} utxo_selection
* @param {PaymentOutputs} outputs
* @param {Address} change_address
* @param {Uint8Array} payload
*/
  constructor(utxo_selection: SelectionContext, outputs: PaymentOutputs, change_address: Address, payload: Uint8Array);
}
/**
* `Wallet` data structure
*/
export class Wallet {
  free(): void;
}
/**
*/
export class WalletAccountV0 {
  free(): void;
}
/**
*/
export class XPrivateKey {
  free(): void;
/**
* @param {string} xprv
* @param {boolean} is_multisig
* @param {bigint} account_index
*/
  constructor(xprv: string, is_multisig: boolean, account_index: bigint);
/**
* @param {number} index
* @returns {PrivateKey}
*/
  receiveKey(index: number): PrivateKey;
/**
* @param {number} index
* @returns {PrivateKey}
*/
  changeKey(index: number): PrivateKey;
}
/**
*/
export class XPrv {
  free(): void;
/**
* @param {string} seed
*/
  constructor(seed: string);
/**
* @param {number} chile_number
* @param {boolean | undefined} hardened
* @returns {XPrv}
*/
  deriveChild(chile_number: number, hardened?: boolean): XPrv;
/**
* @param {any} path
* @returns {XPrv}
*/
  derivePath(path: any): XPrv;
/**
* @param {string} prefix
* @returns {string}
*/
  intoString(prefix: string): string;
/**
* @returns {XPub}
*/
  publicKey(): XPub;
}
/**
*/
export class XPub {
  free(): void;
/**
* @param {string} xpub
*/
  constructor(xpub: string);
/**
* @param {number} chile_number
* @param {boolean | undefined} hardened
* @returns {XPub}
*/
  deriveChild(chile_number: number, hardened?: boolean): XPub;
/**
* @param {any} path
* @returns {XPub}
*/
  derivePath(path: any): XPub;
/**
* @param {string} prefix
* @returns {string}
*/
  intoString(prefix: string): string;
}
/**
*/
export class XPublicKey {
  free(): void;
/**
* @param {string} xprv
* @param {boolean} is_multisig
* @param {bigint} account_index
* @returns {Promise<XPublicKey>}
*/
  static fromXPrv(xprv: string, is_multisig: boolean, account_index: bigint): Promise<XPublicKey>;
/**
* @param {number} start
* @param {number} end
* @returns {Promise<any>}
*/
  receiveAddresses(start: number, end: number): Promise<any>;
/**
* @param {number} start
* @param {number} end
* @returns {Promise<any>}
*/
  changeAddresses(start: number, end: number): Promise<any>;
}
