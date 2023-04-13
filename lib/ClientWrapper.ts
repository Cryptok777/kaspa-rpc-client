import { Client } from "./Client"

export class ClientWrapper {
  clients: Client[]

  constructor({ hosts, verbose }: { hosts: string[]; verbose?: boolean }) {
    this.clients = hosts.map((host) => new Client({ host, verbose }))
  }

  async initialize() {
    await Promise.any(this.clients.map((client) => client.connect()))
    await Promise.any(this.clients.map((client) => client.ping()))
  }

  disconnect() {
    this.clients.forEach((client) => client.disconnect())
  }

  async sleep(ms = 1000) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getClient(): Promise<Client> {
    let client = this.clients.find((client) => client.isReady())
    while (!client) {
      await this.sleep()
      await this.initialize()
      client = this.clients.find((client) => client.isReady())
    }

    return client
  }
}
