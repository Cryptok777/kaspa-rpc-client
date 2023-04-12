import { ClientWrapper, Wallet } from "../../index"

const NODES = [
  "seeder1.kaspad.net:16110",
  "seeder2.kaspad.net:16110",
  "seeder3.kaspad.net:16110",
]

describe("Kaspa RPC Client Integration Test", () => {
  it("should fetch correct blue score", async () => {
    const wrapper = new ClientWrapper({
      hosts: NODES,
    })

    await wrapper.initialize()
    const client = await wrapper.getClient()

    const val = await client.getVirtualSelectedParentBlueScore()
    expect(BigInt(val.blueScore)).toBeGreaterThan(0n)
  })

  it("should fetch correct balance and uxto", async () => {
    const wrapper = new ClientWrapper({
      hosts: NODES,
    })

    await wrapper.initialize()
    const client = await wrapper.getClient()

    const wallet = Wallet.fromPhrase(client, Wallet.randomMnemonic().phrase)
    const account = await wallet.account()
    const address = await account.address()

    const balance = await address.balance()
    const utxos = await address.utxos()

    expect(BigInt(balance)).toEqual(0n)
    expect(utxos.length).toEqual(0)
  })
})
