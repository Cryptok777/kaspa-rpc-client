import { Address } from "../lib/Address"
import { ClientProvider } from "../lib/ClientProvider"
import { PrivateKey } from "../wasm/kaspa_wasm"
import sinon from "sinon"
import { Config } from "../lib/Wallet"
import { Utils } from "../lib/Utils"

describe("Address", () => {
  const client = new ClientProvider()
  const index = 0
  const address =
    "kaspa:qqf92fy4af7tpnukl60n3t77wx8m2zadhc5a6h5gr053nyk74qzsvmt4xpypv"
  const privateKey = new PrivateKey(
    "0000000000000000000000000000000000000000000000000000000000000001"
  )

  const testAddress = new Address(client, index, address, privateKey)
  let txResp = {
    transactionId: "test_hash",
    error: undefined,
  }

  afterEach(() => {
    sinon.restore()
  })

  describe("sendAll", () => {
    it("should successfully send all balance with given fee", async () => {
      const recipient = "test_recipient"
      const fee = 1000n
      const priorityFee = 0

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

      sinon.stub(testAddress, "utxos").resolves(utxos)
      const sendTransactionStub = sinon.stub(Utils, "sendTransaction")
      sendTransactionStub.resolves(txResp)

      const result = await testAddress.sendAll({
        recipient,
        fee,
        priorityFee,
      })

      expect(sendTransactionStub.calledOnce).toBeTruthy()
      expect(result).toEqual({ transactionId: "test_hash", error: undefined })
    })

    it("should successfully send all balance with default fee", async () => {
      const recipient = "test_recipient"
      const balance = 100000n
      const fee = 1000n
      const priorityFee = 0

      const utxos = [
        {
          address: "test_address",
          outpoint: undefined,
          utxoEntry: {
            amount: balance,
            scriptPublicKey: undefined,
            blockDaaScore: 1000n,
            isCoinbase: false,
          },
        },
      ]

      sinon.stub(testAddress, "utxos").resolves(utxos)
      const estimateFeeStub = sinon.stub(Utils, "estimateFee")
      estimateFeeStub.resolves(fee)
      const sendTransactionStub = sinon.stub(Utils, "sendTransaction")
      sendTransactionStub.resolves(txResp)

      const result = await testAddress.sendAll({
        recipient,
        fee: Config.DEFAULT_FEE,
        priorityFee,
      })

      expect(estimateFeeStub.calledOnce).toBeTruthy()
      expect(
        sendTransactionStub.calledOnceWith({
          clientProvider: client,
          utxos,
          privateKeys: [privateKey],
          recipient,
          changeAddress: recipient,
          amount: balance - fee - BigInt(priorityFee),
          fee,
          priorityFee: 0,
        })
      ).toBeTruthy()
      expect(result).toEqual({ transactionId: "test_hash", error: undefined })
    })

    it("should throw an error if balance is zero", async () => {
      const recipient = "test_recipient"
      const fee = 1000n
      const priorityFee = 0

      sinon.stub(testAddress, "utxos").resolves([])

      await expect(
        testAddress.sendAll({
          recipient,
          fee,
          priorityFee,
        })
      ).rejects.toThrow("No UXTO to spend")
    })
  })

  describe("send", () => {
    it("should successfully send transaction with given amount and fee", async () => {
      const recipient = address
      const amount = 5000000n
      const changeAddress = "test_address"
      const fee = 1000n
      const priorityFee = 0

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

      sinon.stub(testAddress, "utxos").resolves(utxos)

      const sendTransactionStub = sinon.stub(Utils, "sendTransaction")
      sendTransactionStub.resolves(txResp)

      const result = await testAddress.send({
        recipient,
        amount,
        changeAddress,
        fee,
        priorityFee,
      })

      expect(sendTransactionStub.calledOnce).toBeTruthy()
      expect(result).toEqual({ transactionId: "test_hash" })
    })

    it("should successfully send transaction with default fee", async () => {
      const recipient = "test_recipient"
      const amount = 5000000n
      const changeAddress = "test_address"

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

      sinon.stub(testAddress, "utxos").resolves(utxos)

      const estimateFeeStub = sinon.stub(Utils, "estimateFee")
      estimateFeeStub.resolves(1000n)

      const sendTransactionStub = sinon.stub(Utils, "sendTransaction")
      sendTransactionStub.resolves(txResp)

      const result = await testAddress.send({
        recipient,
        amount,
        changeAddress,
      })

      expect(estimateFeeStub.calledOnce).toBeTruthy()
      expect(
        sendTransactionStub.calledOnceWith({
          clientProvider: client,
          utxos,
          privateKeys: [privateKey],
          recipient,
          changeAddress,
          amount,
          fee: 1000n,
          priorityFee: 0,
        })
      ).toBeTruthy()
      expect(result).toEqual({ transactionId: "test_hash" })
    })

    it("should throw an error if there are no UTXOs", async () => {
      const recipient = "test_recipient"
      const amount = 5000000n
      const changeAddress = "test_address"
      const fee = 1000n
      const priorityFee = 0

      sinon.stub(testAddress, "utxos").resolves([])

      await expect(
        testAddress.send({
          recipient,
          amount,
          changeAddress,
          fee,
          priorityFee,
        })
      ).rejects.toThrow("No UXTO to spend")
    })
  })

  describe("balance", () => {
    it("should return the correct balance for the address", async () => {
      const getBalanceByAddressStub = sinon.stub(client, "getBalanceByAddress")
      getBalanceByAddressStub.resolves({ balance: 10000000n, error: undefined })

      const result = await testAddress.balance()

      expect(getBalanceByAddressStub.calledOnceWith({ address })).toBeTruthy()
      expect(result).toEqual(BigInt(10000000))
    })
  })

  describe("utxos", () => {
    it("should return the correct UTXOs for the address", async () => {
      const getUtxosByAddressesStub = sinon.stub(client, "getUtxosByAddresses")
      getUtxosByAddressesStub.resolves({
        entries: [
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
        ],
        error: undefined,
      })

      const result = await testAddress.utxos()

      expect(
        getUtxosByAddressesStub.calledOnceWith({ addresses: [address] })
      ).toBeTruthy()
      expect(result).toEqual([
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
      ])
    })
  })

  describe("toString", () => {
    it("should return the address as a string", () => {
      const result = testAddress.toString()

      expect(result).toEqual(
        "kaspa:qqf92fy4af7tpnukl60n3t77wx8m2zadhc5a6h5gr053nyk74qzsvmt4xpypv"
      )
    })
  })
})
