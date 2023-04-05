import { KaspadClientWrapper } from "./KaspadClientWrapper"
import { KaspadClient } from "./KaspadClient"
import sinon, { SinonStub } from "sinon"

describe("KaspadClientWrapper (Sinon)", () => {
  afterEach(() => {
    sinon.restore()
  })

  test("Initialize class with one host and test request method", async () => {
    const hosts = ["host1"]
    const wrapper = new KaspadClientWrapper({ hosts })

    sinon.stub(KaspadClient.prototype, "connect").resolves()
    sinon.stub(KaspadClient.prototype, "ping").resolves()
    sinon
      .stub(KaspadClient.prototype, "getVirtualSelectedParentBlueScore")
      .resolves({ blueScore: 10000, error: undefined })
    sinon.stub(KaspadClient.prototype, "isReady").returns(true)

    await wrapper.initialize()
    const client = await wrapper.getClient()
    const result = await client.getVirtualSelectedParentBlueScore()
    expect(result).toEqual({ blueScore: 10000, error: undefined })
  })

  test("Initialize class with one host and test re-connection", async () => {
    const hosts = ["host1"]
    const wrapper = new KaspadClientWrapper({ hosts })

    sinon.stub(KaspadClient.prototype, "connect").resolves()
    sinon.stub(KaspadClient.prototype, "ping").resolves()
    sinon
      .stub(KaspadClient.prototype, "getVirtualSelectedParentBlueScore")
      .resolves({ blueScore: 10000, error: undefined })
    const isReadyStub: SinonStub = sinon.stub(KaspadClient.prototype, "isReady")

    isReadyStub.onFirstCall().returns(false)
    isReadyStub.onSecondCall().returns(true)

    await wrapper.initialize()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await wrapper.initialize()

    const client = await wrapper.getClient()
    const result = await client.getVirtualSelectedParentBlueScore()
    expect(result).toEqual({ blueScore: 10000, error: undefined })
  })
})
