import { Utils } from "../lib/Utils"
import { RPC, Rust } from "../types/custom-types"
import sinon from "sinon"
import { Config } from "../lib/Wallet"
import { ClientProvider } from "../lib/ClientProvider"
import { PrivateKey, UtxoSet } from "../wasm/kaspa_wasm"

describe("Utils", () => {
  const client = new ClientProvider()
  const address =
    "kaspa:qqf92fy4af7tpnukl60n3t77wx8m2zadhc5a6h5gr053nyk74qzsvmt4xpypv"
  const privateKey = new PrivateKey(
    "0000000000000000000000000000000000000000000000000000000000000001"
  )
  const utxos: RPC.UtxosByAddressesEntry[] = [
    {
      address,
      outpoint: {
        transactionId:
          "d3cdba764beddaa4bfc43cee8cfcbed6fee3f4b1713e9ef69e7aaf7bb9b57ebe",
        index: 0,
      },
      utxoEntry: {
        amount: 10000000n,
        scriptPublicKey: undefined,
        blockDaaScore: 1000n,
        isCoinbase: false,
      },
    },
  ]

  afterEach(() => {
    sinon.restore()
  })

  describe("estimateFee", () => {
    it("should estimate the fee correctly", async () => {
      const recipient = address
      const amount = 10000n

      const estimatedFee = await Utils.estimateFee({
        utxos,
        outputs: [{ recipient, amount }],
      })

      expect(estimatedFee).toBeGreaterThanOrEqual(0n)
    })
  })

  describe("createTransaction", () => {
    it("should create a transaction correctly", async () => {
      const rustUtxos = Utils.convertGRpcUtxosToRustUtxos(utxos)
      const utxoSet = UtxoSet.from({ entries: rustUtxos })

      const recipient = address
      const amount = 10000n
      const changeAddress = address
      const fee = 1000n
      const priorityFee = 0

      const mutableTransaction = await Utils.createTransaction({
        utxoSet,
        outputs: [{ recipient, amount }],
        changeAddress,
        fee,
        priorityFee,
      })

      const rpcTx = {
        version: 0,
        inputs: [
          {
            previousOutpoint: {
              transactionId:
                "d3cdba764beddaa4bfc43cee8cfcbed6fee3f4b1713e9ef69e7aaf7bb9b57ebe",
              index: 0,
            },
            signatureScript: [],
            sequence: 0,
            sigOpCount: 0,
          },
        ],
        outputs: [
          {
            value: 10000,
            scriptPublicKey: {
              version: 0,
              script: [
                32, 18, 85, 36, 149, 234, 124, 176, 207, 150, 254, 159, 56, 175,
                222, 113, 143, 181, 11, 173, 190, 41, 221, 94, 136, 27, 233, 25,
                146, 222, 168, 5, 6, 172,
              ],
            },
          },
          {
            value: 9987964,
            scriptPublicKey: {
              version: 0,
              script: [
                32, 18, 85, 36, 149, 234, 124, 176, 207, 150, 254, 159, 56, 175,
                222, 113, 143, 181, 11, 173, 190, 41, 221, 94, 136, 27, 233, 25,
                146, 222, 168, 5, 6, 172,
              ],
            },
          },
        ],
        lockTime: 0,
        subnetworkId: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        gas: 0,
        payload: [],
      }

      expect(mutableTransaction.toRpcTransaction()).toEqual(rpcTx)
    })

    it("should throw when amount from UTXO is not enough for tx", async () => {
      const rustUtxos = Utils.convertGRpcUtxosToRustUtxos(utxos)
      const utxoSet = UtxoSet.from({ entries: rustUtxos })

      const recipient = address
      const amount = 10000000000000000n
      const changeAddress = address
      const fee = 1000n
      const priorityFee = 0

      await expect(
        Utils.createTransaction({
          utxoSet,
          outputs: [{ recipient, amount }],
          changeAddress,
          fee,
          priorityFee,
        })
      ).rejects.toThrow("Not enough balance from UTXO set")
    })
  })

  describe("sendTransaction", () => {
    it("should send a transaction successfully", async () => {
      const privateKeys = [privateKey]
      const recipient = address
      const amount = 10000n
      const changeAddress = address
      const fee = 1000n
      const priorityFee = 0

      const rustUtxos = Utils.convertGRpcUtxosToRustUtxos(utxos)
      const utxoSet = UtxoSet.from({ entries: rustUtxos })
      const mutableTransaction = await Utils.createTransaction({
        utxoSet,
        outputs: [{ recipient, amount }],
        changeAddress,
        fee,
        priorityFee,
      })

      sinon.stub(Utils, "signTransaction").returns(mutableTransaction)

      const submitTransactionStub = sinon.stub(client, "submitTransaction")
      submitTransactionStub.resolves({
        transactionId: "test_transaction_id",
        error: undefined,
      })

      const response = await Utils.sendTransaction({
        clientProvider: client,
        utxos,
        privateKeys,
        outputs: [{ recipient, amount }],
        changeAddress,
        fee,
        priorityFee,
      })

      expect(response.transactionId).toEqual("test_transaction_id")
      expect(
        submitTransactionStub.calledOnceWith({
          transaction: Utils.convertRustTransactionToGRpcTransaction(
            mutableTransaction.toRpcTransaction() as Rust.Transaction
          ),
          allowOrphan: false,
        })
      ).toBeTruthy()
    })

    it("should throw an error when there are no UTXOs to spend", async () => {
      const utxos: RPC.UtxosByAddressesEntry[] = []
      const privateKeys = [privateKey]
      const recipient = "test_recipient"
      const amount = 10000n
      const changeAddress = "test_changeAddress"
      const fee = Config.DEFAULT_FEE
      const priorityFee = 0

      await expect(
        Utils.sendTransaction({
          clientProvider: client,
          utxos,
          privateKeys,
          outputs: [{ recipient, amount }],
          changeAddress,
          fee,
          priorityFee,
        })
      ).rejects.toThrow("No UXTO to spend")
    })
  })

  describe("getUtxosSum", () => {
    it("should calculate the sum of UTXOs correctly", () => {
      const utxosSum = Utils.getUtxosSum([...utxos, ...utxos])

      expect(utxosSum).toEqual(20000000n)
    })

    it("should return 0 when there are no UTXOs", () => {
      const utxos: RPC.UtxosByAddressesEntry[] = []

      const utxosSum = Utils.getUtxosSum(utxos)

      expect(utxosSum).toEqual(0n)
    })
  })
})
