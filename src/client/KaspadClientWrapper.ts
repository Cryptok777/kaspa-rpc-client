import KaspadClient from "./KaspadClient"

export class KaspadClientWrapper {
  clients: KaspadClient[]

  constructor({ hosts, verbose }: { hosts: string[]; verbose?: boolean }) {
    this.clients = hosts.map((host) => new KaspadClient({ host, verbose }))
  }

  async initialize() {
    await Promise.any(this.clients.map((client) => client.connect()))
    await Promise.any(this.clients.map((client) => client.ping()))
  }

  async sleep(ms: number = 1000) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async request(command: string, payload: object = {}) {
    const client = await this._getClient()
    return await client.request({ command, payload, retries: 4 })
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
    let client = this.clients.find((client) => client.ready)

    while (!client) {
      console.log("No available client found, waiting and re-connecting...")
      await this.sleep(500)
      await this.initialize()
      client = this.clients.find((client) => client.ready)
    }

    return client
  }
}
