import { Mnemonic as RustMnemonic, XPrv } from "../wasm/kaspa_wasm"
import { ClientProvider } from "./ClientProvider"

import { Account } from "./Account"
import { Utils } from "./Utils"

interface ConfigProps {
  DEFAULT_FEE: bigint
  DEFAULT_COMPOUND_FEE: bigint
  SCAN_BATCH_SIZE: number
  MAX_SCAN_SIZE: number
}

export const Config: ConfigProps = {
  DEFAULT_FEE: 0n,
  DEFAULT_COMPOUND_FEE: 1000000n,
  SCAN_BATCH_SIZE: 50,
  MAX_SCAN_SIZE: 5000,
}

export class Wallet {
  private clientProvider: ClientProvider
  private root: string // xPrv

  constructor(clientProvider: ClientProvider) {
    this.clientProvider = clientProvider
    const xPrv = new XPrv(RustMnemonic.random().toSeed(""))
    this.root = xPrv.intoString("xprv")
  }

  /**
   * Initialize a `Wallet` object from mnemonic pharse
   */
  static fromPhrase(clientProvider: ClientProvider, phrase: string) {
    const wallet = new Wallet(clientProvider)
    const xPrv = new XPrv(new RustMnemonic(phrase).toSeed(""))
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet
  }

  /**
   * Initialize a `Wallet` object from seed (without password)
   */
  static fromSeed(clientProvider: ClientProvider, seed: string) {
    const wallet = new Wallet(clientProvider)
    const xPrv = new XPrv(seed)
    wallet.setRoot(xPrv.intoString("xprv"))
    return wallet
  }

  /**
   * Initialize a `Wallet` object from private key string
   */
  static fromPrivateKey(clientProvider: ClientProvider, xPrv: string) {
    if (!xPrv) {
      throw new Error("Private key should not be empty")
    }

    const wallet = new Wallet(clientProvider)
    wallet.setRoot(xPrv)
    return wallet
  }

  /**
   * Return a random mnemonic phrase that can be used to initialize a wallet
   */
  static randomMnemonic(): { phrase: string, entropy: string } {
    const mnemonic = RustMnemonic.random()
    return {
      phrase: mnemonic.phrase,
      entropy: mnemonic.entropy,
    }
  }

  /**
   * Set `xPrv` of the wallet, you don't have to explicitly call this,
   * as it's used by factory methods
   */
  setRoot(xPrv: string) {
    this.root = xPrv
  }

  /**
   * Return a `Account` object from this wallet, given the account `index`
   */
  async account(index = 0n) {
    const xPublicKey = await Utils.getXPublicKey(this.root, index)
    const xPrivateKey = await Utils.getXPrivateKey(this.root, index)

    return new Account(this.clientProvider, index, xPublicKey, xPrivateKey)
  }
}
