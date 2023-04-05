import { KaspadClient } from "./KaspadClient"

export class KaspadClientWrapper {
  clients: KaspadClient[]

  constructor({ hosts, verbose }: { hosts: string[]; verbose?: boolean }) {
    this.clients = hosts.map((host) => new KaspadClient({ host, verbose }))
  }

  async initialize() {
    await Promise.race(this.clients.map((client) => client.connect()))
    await Promise.race(this.clients.map((client) => client.ping()))
  }

  async sleep(ms = 1000) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getClient(): Promise<KaspadClient> {
    let client = this.clients.find((client) => client.isReady())
    while (!client) {
      await this.sleep(500)
      await this.initialize()
      client = this.clients.find((client) => client.isReady())
    }

    return client
  }
}
