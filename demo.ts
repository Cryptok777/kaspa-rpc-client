import { KaspadClientWrapper } from "./src/"

const run = async () => {
  // Initilize the clients
  const wrapper = new KaspadClientWrapper({
    hosts: ["kaspadns.kaspacalc.net:16110"],
    // verbose: true, ---> Verbose log
  })
  await wrapper.initialize()

  // Get one client from the pool
  const client = await wrapper.getClient()

  // Example method calls for KaspadClient class methods starting with "get":

  // Get a block by hash:
  const block = await client.getBlock({
    hash: "6ef1913d30316304254aa5ce6c34ff9dd2b519231bb80194d4b5e5449412e924",
    includeTransactions: true,
  })
  console.log(block)

  // Get unspent transaction outputs (UTXOs) for a list of addresses:
  const utxos = await client.getUtxosByAddresses({
    addresses: [
      "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
    ],
  })
  console.log(utxos)

  // Get the balance for a specific address:
  const balance = await client.getBalanceByAddress({
    address:
      "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
  })
  console.log(balance)

  // Get balances for a list of addresses:
  const balances = await client.getBalancesByAddresses({
    addresses: [
      "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
    ],
  })
  console.log(balances)

  // Get the virtual selected parent blue score:
  const vsbs = await client.getVirtualSelectedParentBlueScore()
  console.log(vsbs)

  // Get the latest block template:
  const blockTemplate = await client.getBlockTemplate({
    payAddress:
      "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
    extraData: "",
  })
  console.log(blockTemplate)

  // Get the current state of the block DAG:
  const blockDagInfo = await client.getBlockDagInfo()
  console.log(blockDagInfo)

  // Get information about the node's current state:
  const info = await client.getInfoRequest()
  console.log(info)

  // Get an estimate of the current network's hashes per second:
  const networkHashRate = await client.estimateNetworkHashesPerSecond({
    windowSize: 1000,
    startHash:
      "6ef1913d30316304254aa5ce6c34ff9dd2b519231bb80194d4b5e5449412e924",
  })
  console.log(networkHashRate)

  // Get the current coin supply:
  const coinSupply = await client.getCoinSupply()
  console.log(coinSupply)

  // Example notifier calls
  client.subscribeUtxosChanged(
    {
      addresses: [
        "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
      ],
    },
    (res) => {
      console.log(
        `subscribeUtxosChanged callback: ${JSON.stringify(res, null, 4)}`
      )
    }
  )
}

;(async () => {
  await run()
})()
