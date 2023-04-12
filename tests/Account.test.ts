import { Account } from "../lib/Account"
import { ClientProvider } from "../lib/ClientProvider"
import { Wallet } from "../lib/Wallet"
import sinon from "sinon"
import { Address } from "../lib/Address"
import { AddressType, RPC } from "../types/custom-types"
import { PrivateKey } from "../wasm/kaspa_wasm"
import { Utils } from "../lib/Utils"

describe("Account", () => {
  let client: ClientProvider
  let xPublicKey: any
  let xPrivateKey: any
  let index: bigint
  let account: Account
  const privateKey = new PrivateKey(
    "0000000000000000000000000000000000000000000000000000000000000001"
  )
  const txResp = {
    transactionId: "tx_id",
    error: undefined,
  }
  const address =
    "kaspa:qqf92fy4af7tpnukl60n3t77wx8m2zadhc5a6h5gr053nyk74qzsvmt4xpypv"

  beforeEach(() => {
    client = new ClientProvider()
    xPublicKey = {}
    xPrivateKey = {}
    index = 0n
    account = new Account(client, index, xPublicKey, xPrivateKey)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe("constructor", () => {
    it("should create an Account instance", () => {
      expect(account).toBeInstanceOf(Account)
    })

    it("should have the correct properties", () => {
      expect(account).toHaveProperty("clientProvider", client)
      expect(account).toHaveProperty("index", index)
      expect(account).toHaveProperty("xPublicKey", xPublicKey)
      expect(account).toHaveProperty("xPrivateKey", xPrivateKey)
      expect(account).toHaveProperty("scannedAddresses", [])
    })
  })

  describe("fromPhrase", () => {
    const phrase =
      "enter skin title mask pony island maze curtain sail bind hamster forget oxygen photo subject surround inform gadget exist apart faith rib road retire"
    let walletStub: sinon.SinonStub

    beforeEach(() => {
      walletStub = sinon.stub(Wallet.prototype, "account")
    })

    it("should call Wallet.prototype.account with the correct index", async () => {
      walletStub.returns(Promise.resolve(account))
      await Account.fromPhrase(client, phrase, index)
      expect(walletStub.calledWith(index)).toBeTruthy()
    })

    it("should return an Account instance", async () => {
      walletStub.returns(Promise.resolve(account))
      const result = await Account.fromPhrase(client, phrase, index)
      expect(result).toBeInstanceOf(Account)
    })
  })

  describe("fromSeed", () => {
    const seed =
      "48abbf16b177b253dd80b595c7463dc6c62392a48603b735c4ce4ecaa4788569ffb16c47d86e6c883ba4e1252fd708a3dfb347ba0312acccfe4a9c366c50f71b"
    let walletStub: sinon.SinonStub

    beforeEach(() => {
      walletStub = sinon.stub(Wallet.prototype, "account")
    })

    afterEach(() => {
      walletStub.restore()
    })

    it("should call Wallet.prototype.account with the correct index", async () => {
      walletStub.returns(Promise.resolve(account))
      await Account.fromSeed(client, seed, index)
      expect(walletStub.calledWith(index)).toBeTruthy()
    })

    it("should return an Account instance", async () => {
      walletStub.returns(Promise.resolve(account))
      const result = await Account.fromSeed(client, seed, index)
      expect(result).toBeInstanceOf(Account)
    })
  })

  describe("address", () => {
    afterEach(() => {
      sinon.restore()
    })

    it("should return a receive address by default", async () => {
      const addressStub = sinon
        .stub(account, "address")
        .returns(
          Promise.resolve(new Address(client, 0, "receiveAddress", privateKey))
        )

      const result = await account.address()
      expect(result).toBeInstanceOf(Address)
      expect(result.toString()).toBe("receiveAddress")

      addressStub.restore()
    })

    it("should return a receive address when specified", async () => {
      const addressStub = sinon
        .stub(account, "address")
        .returns(
          Promise.resolve(new Address(client, 0, "receiveAddress", privateKey))
        )

      const result = await account.address(0, AddressType.Receive)
      expect(result).toBeInstanceOf(Address)
      expect(result.toString()).toBe("receiveAddress")

      addressStub.restore()
    })

    it("should return a change address when specified", async () => {
      const addressStub = sinon
        .stub(account, "address")
        .returns(
          Promise.resolve(new Address(client, 0, "changeAddress", privateKey))
        )

      const result = await account.address(0, AddressType.Change)
      expect(result).toBeInstanceOf(Address)
      expect(result.toString()).toBe("changeAddress")

      addressStub.restore()
    })
  })

  describe("addresses", () => {
    it("should return an array of Address instances for the specified range and address type", async () => {
      const address1 = new Address(client, 0, "receiveAddress1", privateKey)
      const address2 = new Address(client, 1, "receiveAddress2", privateKey)
      const address3 = new Address(client, 2, "receiveAddress3", privateKey)

      const addressStub = sinon.stub(account, "address")
      addressStub.onCall(0).resolves(address1)
      addressStub.onCall(1).resolves(address2)
      addressStub.onCall(2).resolves(address3)

      const start = 0
      const end = 3
      const type = AddressType.Receive

      const result = await account.addresses(start, end, type)

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toEqual(end - start)
      expect(result[0]).toEqual(address1)
      expect(result[1]).toEqual(address2)
      expect(result[2]).toEqual(address3)
      expect(addressStub.callCount).toEqual(end - start)
      expect(addressStub.calledWith(0, AddressType.Receive)).toBe(true)
      expect(addressStub.calledWith(1, AddressType.Receive)).toBe(true)
      expect(addressStub.calledWith(2, AddressType.Receive)).toBe(true)
    })
  })

  describe("scan", () => {
    it("should successfully scan and return addresses with non-zero utxos", async () => {
      const addressesStub = sinon.stub(account, "addresses")
      for (let i = 0; i < 4; i++) {
        addressesStub
          .onCall(i)
          .resolves([new Address(client, i, `test_address_${i}`, privateKey)])
      }

      const utxosStub = sinon.stub(Address.prototype, "utxos")
      utxosStub.onCall(0).resolves([
        {
          address: "test_address_1",
          outpoint: undefined,
          utxoEntry: {
            amount: 1000n,
            scriptPublicKey: undefined,
            blockDaaScore: 1000n,
            isCoinbase: false,
          },
        },
      ])
      utxosStub.onCall(1).resolves([
        {
          address: "test_address_2",
          outpoint: undefined,
          utxoEntry: {
            amount: 1000n,
            scriptPublicKey: undefined,
            blockDaaScore: 1000n,
            isCoinbase: false,
          },
        },
      ])
      utxosStub.onCall(2).resolves([])
      utxosStub.onCall(3).resolves([])

      const result = await account.scan()

      expect(result.length).toBe(2)
      expect(result[0].address).toBe("test_address_0")
      expect(result[1].address).toBe("test_address_1")
    })
  })

  describe("send", () => {
    it("should successfully send the specified amount to the recipient", async () => {
      const utxos = [
        {
          address: "test_address",
          outpoint: undefined,
          utxoEntry: {
            amount: 10000000n,
            scriptPublicKey: undefined,
            blockDaaScore: 1000n,
            isCoinbase: false,
          },
        },
      ]
      sinon
        .stub(account, "scan")
        .resolves([new Address(client, 0, "test_address", privateKey)])
      sinon.stub(client, "getUtxosByAddresses").resolves({
        entries: utxos,
        error: undefined,
      })
      const estimateFeeStub = sinon.stub(Utils, "estimateFee").resolves(1000n)
      const sendTransactionStub = sinon
        .stub(Utils, "sendTransaction")
        .resolves({
          transactionId: "123",
        } as RPC.SubmitTransactionResponseMessage)

      const amount = 10000n
      const recipient = "recipient_address"
      const changeAddress = "change_address"

      const result = await account.send({
        outputs: [{ recipient, amount }],
        changeAddress,
      })

      expect(result).toMatchObject({ transactionId: "123" })
      expect(estimateFeeStub.calledOnce).toBe(true)
      expect(
        sendTransactionStub.calledOnceWith({
          clientProvider: client,
          utxos,
          privateKeys: [privateKey],
          outputs: [{ recipient, amount }],
          changeAddress,
          fee: 1000n,
          priorityFee: 0,
        })
      ).toBe(true)
    })
  })

  describe("sendAll", () => {
    it("should successfully send all balance using sendAll method", async () => {
      const utxos = [
        {
          address: address,
          outpoint: undefined,
          utxoEntry: {
            amount: 100000n,
            scriptPublicKey: undefined,
            blockDaaScore: 1000n,
            isCoinbase: false,
          },
        },
      ]
      const scanStub = sinon.stub(account, "scan")
      scanStub.resolves([new Address(client, 0, address, privateKey)])

      const utxosForAddressesStub = sinon.stub(client, "getUtxosByAddresses")
      utxosForAddressesStub.resolves({
        entries: utxos,
        error: undefined,
      })

      sinon.stub(Utils, "estimateFee").resolves(1000n)

      const sendTransactionStub = sinon.stub(Utils, "sendTransaction")
      sendTransactionStub.resolves(txResp)

      const result = await account.sendAll({ recipient: address })
      const amount = 100000n - 1000n

      expect(result).toBe(txResp)
      expect(
        sendTransactionStub.calledOnceWith({
          clientProvider: client,
          utxos,
          privateKeys: [privateKey],
          outputs: [{ recipient: address, amount }],
          changeAddress: address,
          fee: 1000n,
          priorityFee: 0,
        })
      ).toBeTruthy()
    })
  })

  describe("compound", () => {
    it("should successfully compound balance using compound method", async () => {
      const sendAllStub = sinon.stub(account, "sendAll")
      sendAllStub.resolves(txResp)

      const result = await account.compound(address)

      expect(result).toBe(txResp)
      expect(
        sendAllStub.calledOnceWith({
          recipient: address,
        })
      ).toBeTruthy()
    })
  })

  describe("balance", () => {
    it("should successfully get balance using balance method", async () => {
      const getBalancesByAddressesStub = sinon.stub(
        client,
        "getBalancesByAddresses"
      )
      getBalancesByAddressesStub.resolves({
        entries: [
          {
            address: "test_address",
            balance: 10000000n,
            error: undefined,
          },
        ],
        error: undefined,
      })

      const scanStub = sinon.stub(account, "scan")
      scanStub.resolves([new Address(client, 0, "test_address_1", privateKey)])

      const result = await account.balance()

      expect(result).toBe(10000000n)
    })
  })

  describe("utxos", () => {
    it("should successfully get utxos using utxos method", async () => {
      const utxosForAddressesStub = sinon.stub(client, "getUtxosByAddresses")
      utxosForAddressesStub.resolves({
        entries: [
          {
            address: "test_address_1",
            outpoint: undefined,
            utxoEntry: {
              amount: 1000n,
              scriptPublicKey: undefined,
              blockDaaScore: 1000n,
              isCoinbase: false,
            },
          },
        ],
        error: undefined,
      })

      const scanStub = sinon.stub(account, "scan")
      scanStub.resolves([new Address(client, 0, "test_address_1", privateKey)])

      const result = await account.utxos()

      expect(result.length).toBe(1)
      expect(result[0].address).toBe("test_address_1")
    })
  })
})
