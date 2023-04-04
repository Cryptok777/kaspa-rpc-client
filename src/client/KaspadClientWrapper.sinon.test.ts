import { KaspadClientWrapper } from './KaspadClientWrapper'
import { KaspadClient } from './KaspadClient'
import sinon, { SinonStub } from 'sinon'

describe('KaspadClientWrapper (Sinon)', () => {
  afterEach(() => {
    sinon.restore()
  })

  test('Initialize class with one host and test request method', async () => {
    const hosts = ['host1']
    const wrapper = new KaspadClientWrapper({ hosts })

    sinon.stub(KaspadClient.prototype, 'connect').resolves()
    sinon.stub(KaspadClient.prototype, 'ping').resolves()
    sinon.stub(KaspadClient.prototype, 'request').resolves({ result: true })
    sinon.stub(KaspadClient.prototype, 'isReady').returns(true)

    await wrapper.initialize()
    const result = await wrapper.request('getBlockDagInfoRequest')
    expect(result).toEqual({ result: true })
  })

  test('Initialize class with one host and test re-connection', async () => {
    const hosts = ['host1']
    const wrapper = new KaspadClientWrapper({ hosts })

    sinon.stub(KaspadClient.prototype, 'connect').resolves()
    sinon.stub(KaspadClient.prototype, 'ping').resolves()
    sinon.stub(KaspadClient.prototype, 'request').resolves({ result: true })
    const isReadyStub: SinonStub = sinon.stub(KaspadClient.prototype, 'isReady')

    isReadyStub.onFirstCall().returns(false)
    isReadyStub.onSecondCall().returns(true)

    await wrapper.initialize()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await wrapper.initialize()

    const result = await wrapper.request('getBlockDagInfoRequest')
    expect(result).toEqual({ result: true })
  })

  test('Initialize class with one host and test retries', async () => {
    const hosts = ['host1']
    const wrapper = new KaspadClientWrapper({ hosts })

    sinon.stub(KaspadClient.prototype, 'connect').resolves()
    sinon.stub(KaspadClient.prototype, 'ping').resolves()
    const requestStub = sinon.stub(KaspadClient.prototype, 'request')
    sinon.stub(KaspadClient.prototype, 'isReady').returns(true)

    requestStub.onFirstCall().rejects()
    requestStub.onSecondCall().resolves({ result: true })

    await wrapper.initialize()
    const result = await wrapper.request('getBlockDagInfoRequest')
    expect(result).toEqual({ result: true })
  })
})
