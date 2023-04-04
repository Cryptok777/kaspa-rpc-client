import KaspadClient from "./KaspadClient"

export class KaspadClientWrapper {
  clients: KaspadClient[]

  constructor(hosts: string[]) {
    this.clients = hosts.map((host) => new KaspadClient(host))
  }

  getClient() {
    return this.clients.find((client) => client.ready)
  }

  async initialize() {
    await Promise.all(this.clients.map((client) => client.ping()))
  }

  async sleep(ms: number = 2000) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async request(command: string, payload: object = {}) {
    let client = this.getClient()
    while (!client) {
      console.debug("No available client found, waiting and re-connecting...")
      await this.sleep()
      client = this.getClient()
    }

    return await client.request({ command, payload, retries: 4 })
  }
}
