import { KaspaRpcClient } from "./src/"

const run = async () => {
  const client = new KaspaRpcClient({
    hosts: ["kaspadns.kaspacalc.net:16110"],
    // verbose: true,
  })
  await client.initialize()

  const resp = await client.request("getBlockRequest", {
    hash: "a7052f5afa83bf39d0ba1dde5536389b49c9d87e107e2daacdf62b9b28247216",
  })
  console.log(resp)

  client.subscribe("notifyVirtualDaaScoreChangedRequest", {}, (data: any) => {
    console.log(data)
  })
}

;(async () => {
  await run()
})()
