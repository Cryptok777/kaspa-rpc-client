import { Mnemonic as RustMnemonic, XPrv } from "../wasm/kaspa_wasm"
import { ClientProvider } from "./ClientProvider"

import { Account } from "./Account"
import { Utils } from "./Utils"

interface ConfigProps {
  DEFAULT_FEE: bigint
  DEFAULT_COMPOUND_FEE: bigint
  SCAN_BATCH_SIZE: number
}

export const Config: ConfigProps = {
  // Reserved fee, if the actual fee is lower,
  // remaining will be sent to change address
  DEFAULT_FEE: 0n,
  DEFAULT_COMPOUND_FEE: 1000000n,
  SCAN_BATCH_SIZE: 50,
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
    const xPublicKey = await Utils.getXPublicKey(this.root, index)
    const xPrivateKey = await Utils.getXPrivateKey(this.root, index)

    return new Account(this.clientProvider, index, xPublicKey, xPrivateKey)
  }
}
