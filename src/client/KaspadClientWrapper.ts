import { KaspadClient } from './KaspadClient'

export class KaspadClientWrapper {
  clients: KaspadClient[]

  constructor({ hosts, verbose }: { hosts: string[]; verbose?: boolean }) {
    this.clients = hosts.map((host) => new KaspadClient({ host, verbose }))
  }

  async initialize() {
    await Promise.any(this.clients.map((client) => client.connect()))
    await Promise.any(this.clients.map((client) => client.ping()))
  }

  async sleep(ms = 1000) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async request(command: string, payload: object = {}) {
    const client = await this._getClient()
    try {
      return await client.request({ command, payload })
    } catch (error) {
      return await client.request({ command, payload, retries: 3 })
    }
  }

  subscribe(subject: string, data: any = {}, callback: Function) {
    this._getClient().then((client) => {
      client.subscribe(subject, data, callback)
    })
  }

  unSubscribe(subject: string) {
    this._getClient().then((client) => {
      client.unSubscribe(subject)
    })
  }

  async _getClient(): Promise<KaspadClient> {
    let client = this.clients.find((client) => client.isReady())
    while (!client) {
      await this.sleep(500)
      await this.initialize()
      client = this.clients.find((client) => client.isReady())
    }

    return client
  }
}
