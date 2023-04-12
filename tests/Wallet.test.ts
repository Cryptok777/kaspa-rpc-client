import { ClientProvider } from "../lib/ClientProvider"
import { Utils } from "../lib/Utils"
import sinon from "sinon"
import { XPrv } from "../wasm/kaspa_wasm"
import { Wallet } from "../lib/Wallet"
import { Account } from "../lib/Account"

describe("Wallet", () => {
  let clientProviderStub: sinon.SinonStubbedInstance<ClientProvider>
  let utilsGetXPublicKeyStub: sinon.SinonStub
  let utilsGetXPrivateKeyStub: sinon.SinonStub
  let xPrvToStringStub: sinon.SinonStub

  beforeEach(() => {
    clientProviderStub = sinon.createStubInstance(ClientProvider)
    utilsGetXPublicKeyStub = sinon.stub(Utils, "getXPublicKey")
    utilsGetXPrivateKeyStub = sinon.stub(Utils, "getXPrivateKey")
    xPrvToStringStub = sinon.stub(XPrv.prototype, "intoString")
  })

  afterEach(() => {
    sinon.restore()
  })

  it("should create a new Wallet instance", () => {
    const wallet = new Wallet(clientProviderStub)
    expect(wallet).toBeInstanceOf(Wallet)
  })

  it("should create Wallet from phrase", () => {
    const phrase =
      "enter skin title mask pony island maze curtain sail bind hamster forget oxygen photo subject surround inform gadget exist apart faith rib road retire"
    const wallet = Wallet.fromPhrase(clientProviderStub, phrase)
    expect(wallet).toBeInstanceOf(Wallet)
  })

  it("should create Wallet from seed", () => {
    const seed =
      "48abbf16b177b253dd80b595c7463dc6c62392a48603b735c4ce4ecaa4788569ffb16c47d86e6c883ba4e1252fd708a3dfb347ba0312acccfe4a9c366c50f71b"
    const wallet = Wallet.fromSeed(clientProviderStub, seed)
    expect(wallet).toBeInstanceOf(Wallet)
  })

  it("should create Wallet from private key", () => {
    const xPrv =
      "xprv9s21ZrQH143K2dW44LnMs96SQZyC91wKCHR9rzFg8Tyj25Nqr3wkb5Pdp7DhajgjRVKwPECgkrEENEFbnAkoYuhjZ4Lb9H15NkSx5CA8otZ"
    const wallet = Wallet.fromPrivateKey(clientProviderStub, xPrv)
    expect(wallet).toBeInstanceOf(Wallet)
  })

  it("should return an account", async () => {
    const wallet = new Wallet(clientProviderStub)
    const index = 0n
    const xPublicKey = "some xpublic key"
    const xPrivateKey = "some xprivate key"

    utilsGetXPublicKeyStub.resolves(xPublicKey)
    utilsGetXPrivateKeyStub.resolves(xPrivateKey)

    const account = await wallet.account(index)

    expect(account).toBeInstanceOf(Account)
    expect(
      utilsGetXPublicKeyStub.calledWith(wallet["root"], index)
    ).toBeTruthy()
    expect(
      utilsGetXPrivateKeyStub.calledWith(wallet["root"], index)
    ).toBeTruthy()
  })

  it("should throw an error when the phrase is in bad format", () => {
    const emptyPhrase = ""

    expect(() => {
      Wallet.fromPhrase(clientProviderStub, emptyPhrase)
    }).toThrow("Bip39 error")
  })

  it("should throw an error when the seed is empty", () => {
    const emptySeed = ""

    expect(() => {
      Wallet.fromSeed(clientProviderStub, emptySeed)
    }).toThrow("Invalid seed length")
  })

  it("should throw an error when the private key is empty", () => {
    const emptyPrivateKey = ""

    expect(() => {
      Wallet.fromPrivateKey(clientProviderStub, emptyPrivateKey)
    }).toThrow("Private key should not be empty")
  })
})
