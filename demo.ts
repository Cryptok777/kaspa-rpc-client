import { KaspaRpcClient } from "./src/"

const run = async () => {
  const client = new KaspaRpcClient([
    // "65.21.88.223:16110",
    // "79.120.76.62:16110",
    // "89.108.117.245:16110",
    // "141.95.124.98:16110",
    "149.28.241.71:16110",
  ])
  await client.initialize()
  const val = await client.request("getBlockDagInfoRequest")
  console.log(val)
}

;(async () => {
  await run()
})()
