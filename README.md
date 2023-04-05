# Kaspa RPC Client for Node.js 📚

## Table of Contents 📑

- [Features](#features-🌟)
- [Requirements](#requirements-🛠️)
- [Installation](#installation-💿)
- [Usage](#usage-🚀)
- [Donation](#donation-💖)

## Features 🌟

- This library is written in TypeScript, with methods auto-generated from the Kaspa [RPC server](https://github.com/kaspanet/kaspad/blob/c5aade7e7fe2ada7d97a0e30df9b4b36b4842f9e/infrastructure/network/netadapter/server/grpcserver/protowire/rpc.md#protowire.NotifyUtxosChangedRequestMessage). All requests and responses are typed for easier development.
- Supports multiple RPC connections with different servers and automatically handles failover if one of the servers fails to connect.

## Requirements 🛠️

- `Node >= 15.0.0`

## Installation 💿

```bash
npm install kaspa-rpc-client
```

## Usage 🚀

Here's an example of how to use the Kaspa RPC Client library:

### Step 1: Import `KaspadClientWrapper`

```javascript
const { KaspadClientWrapper } = require("kaspa-rpc-client")
```

### Step 2: Initialize `KaspadClientWrapper`

You can pass multiple hosts to the wrapper, the wrappper will figure out which one to use. You can also enable the verbose log by `verbose: true`

```javascript
const wrapper = new KaspadClientWrapper({
  hosts: ["kaspadns.kaspacalc.net:16110"],
  verbose: true,
})
await wrapper.initialize()
```

### Step 3: Get client from the pool

The `.getClient()` method ensures that you will always get the server that is ready to handle requests

```javascript
const client = await wrapper.getClient()
```

### Step 4: Make RPC calls

#### Get a block by hash

```javascript
const block = await client.getBlock({
  hash: "6ef1913d30316304254aa5ce6c34ff9dd2b519231bb80194d4b5e5449412e924",
  includeTransactions: true,
})
```

#### Get unspent transaction outputs (UTXOs) for a list of addresses

```javascript
const utxos = await client.getUtxosByAddresses({
  addresses: [
    "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
  ],
})
```

#### Get a block by hash

```javascript
const balance = await client.getBalanceByAddress({
  address:
    "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
})
```

#### Get a block by hash

```javascript
const balances = await client.getBalancesByAddresses({
  addresses: [
    "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
  ],
})
```

#### Get the virtual selected parent blue score

```javascript
const vsbs = await client.getVirtualSelectedParentBlueScore()
```

#### Get the latest block template

```javascript
const blockTemplate = await client.getBlockTemplate({
  payAddress:
    "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
  extraData: "",
})
```

#### Get the current state of the block DAG

```javascript
const blockDagInfo = await client.getBlockDagInfo()
```

#### Get information about the node's current state

```javascript
const info = await client.getInfoRequest()
```

#### Get an estimate of the current network's hashes per second

```javascript
const networkHashRate = await client.estimateNetworkHashesPerSecond({
  windowSize: 1000,
  startHash: "6ef1913d30316304254aa5ce6c34ff9dd2b519231bb80194d4b5e5449412e924",
})
```

#### Get the current coin supply

```javascript
const coinSupply = await client.getCoinSupply()
```

#### Subscribe to `UtxosChangedNotification`

```javascript
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
```

#### Subscribe to `VirtualSelectedParentBlueScoreChangedNotification`

```javascript
client.subscribeVirtualSelectedParentBlueScoreChanged((res) => {
  console.log(`subscribeVirtualSelectedParentBlueScoreChanged callback: ${res}`)
})
```
Example code can be found in [demo.ts](https://github.com/Cryptok777/kaspa-rpc-client/blob/main/demo.ts). This is not the full list of available methods, refer to [here for all available methods](https://github.com/Cryptok777/kaspa-rpc-client/blob/main/lib/KaspadClient.ts).

You can also find [interface for all requests/response](https://github.com/Cryptok777/kaspa-rpc-client/blob/main/types/rpc.d.ts), but it's likely that your IDE will show this information for you since it's written in TypeScript

## Contribute ✨

If you find that the RPC endpoint you are looking for is not exposed by the client library, feel free to create a pull request to add it:

1. Run `./scripts/update-proto.sh` to fetch the latest proto files from the Kaspad repo. This will automatically generate the TypeScript interfaces for you
2. Copy the request/response interfaces that you would like to add to `./types/rpc.d.ts`
3. Expose the method with the typed interfaces from the last step in `./lib/KaspadClient.ts`


## Donation 💖

This project is built by the team that brought you [Kas.fyi](https://kas.fyi/). If you find this library useful, feel free to donate to `kaspa:qpnsy5fc592kcnu6vnx8aknskhmu6x9qksec084v043pjk5hur6vw9e87wpg2`. Your support is greatly appreciated!
