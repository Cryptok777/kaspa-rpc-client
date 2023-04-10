import { ClientWrapper } from "./ClientWrapper"
import { Client } from "./Client"
import sinon, { SinonStub } from "sinon"

describe("ClientWrapper (Sinon)", () => {
  afterEach(() => {
    sinon.restore()
  })

  test("Initialize class with one host and test request method", async () => {
    const hosts = ["host1"]
    const wrapper = new ClientWrapper({ hosts })

    sinon.stub(Client.prototype, "connect").resolves()
    sinon.stub(Client.prototype, "ping").resolves()
    sinon
      .stub(Client.prototype, "getVirtualSelectedParentBlueScore")
      .resolves({ blueScore: 10000n, error: undefined })
    sinon.stub(Client.prototype, "isReady").returns(true)

    await wrapper.initialize()
    const client = await wrapper.getClient()
    const result = await client.getVirtualSelectedParentBlueScore()
    expect(result).toEqual({ blueScore: 10000n, error: undefined })
  })

  test("Initialize class with one host and test re-connection", async () => {
    const hosts = ["host1"]
    const wrapper = new ClientWrapper({ hosts })

    sinon.stub(Client.prototype, "connect").resolves()
    sinon.stub(Client.prototype, "ping").resolves()
    sinon
      .stub(Client.prototype, "getVirtualSelectedParentBlueScore")
      .resolves({ blueScore: 10000n, error: undefined })
    const isReadyStub: SinonStub = sinon.stub(Client.prototype, "isReady")

    isReadyStub.onFirstCall().returns(false)
    isReadyStub.onSecondCall().returns(true)

    await wrapper.initialize()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await wrapper.initialize()

    const client = await wrapper.getClient()
    const result = await client.getVirtualSelectedParentBlueScore()
    expect(result).toEqual({ blueScore: 10000n, error: undefined })
  })
})
