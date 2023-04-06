let kaspa = require("../wasm/kaspa_wasm")
let { Mnemonic, XPrv, DerivationPath, XPublicKey, XPrivateKey, UtxoSet } = kaspa
import { RPC as Rpc } from "../types/custom-types"

interface GetRandomMnemonicResponse {
  entropy: string
  phrase: string
}

export class KaspadWallet {
  constructor() {}

  static getMnemonic(pharse: string): GetRandomMnemonicResponse {
    return new Mnemonic(pharse)
  }

  static getRandomMnemonic(): GetRandomMnemonicResponse {
    return Mnemonic.random()
  }


  static async mnemonicToSeed(pharse: string, password: string) {
    const seed = new Mnemonic(pharse).toSeed('') // Kaspium uses empty password

    let xPrv = new XPrv(seed)
    xPrv = xPrv.derivePath("m/44'/111111'/0'").deriveChild(0).deriveChild(0)

    const xPublicKey = await XPublicKey.fromXPrv(xPrv.intoString('kprv'), false, 0n)

    // console.log("xPublicKey", xPublicKey)
    const addresses = await xPublicKey.receiveAddresses(0, 1)
    return addresses[0]
  }

  static getUtxoSet(utxos: Rpc.GetUtxosByAddressesResponseMessage) {
    console.log(utxos);
    
    return UtxoSet.from(utxos)
  }

  // static getRandomMnemonic(): string {
  //   return Mnemonic.random()
  // }

  // static validateAddress(address: string): boolean {
  //   throw new Error()
  // }
  // static getAddresses(): string {
  //   throw new Error()
  // }
  // static createAddresses(): string {
  //   throw new Error()
  // }
  // static send(recipient, amount, password): string {
  //   throw new Error()
  // }
  // static sendFrom(sender, recipient, amount, password): string {
  //   throw new Error()
  // }
}
