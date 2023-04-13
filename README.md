# Kaspa RPC Client for Node.js

## Features

- This library is written in TypeScript, with methods auto-generated from the Kaspa [RPC server](https://github.com/kaspanet/kaspad/blob/c5aade7e7fe2ada7d97a0e30df9b4b36b4842f9e/infrastructure/network/netadapter/server/grpcserver/protowire/rpc.md#protowire.NotifyUtxosChangedRequestMessage). All requests and responses are typed for easier development.
- Supports multiple RPC connections with different servers and automatically handles failover if one of the servers fails to connect.
- **[NEW]** Implemented Wallet, Account and Address feature, using the WASM library, let you create, manage the wallet and send transactions with zero effort.
## Live Demo
Check out [here](https://codesandbox.io/p/sandbox/kaspa-rpc-client-demo-3k180p?file=%2Fsrc%2Fwallet.ts&selection=%5B%7B%22endColumn%22%3A15%2C%22endLineNumber%22%3A6%2C%22startColumn%22%3A15%2C%22startLineNumber%22%3A6%7D%5D) for live demo, click `Fork` at the top right corner and then you can test the SDK directly in the browser
## Requirements

- `Node >= 16.14`

## Installation

```bash
npm install kaspa-rpc-client
```

## Use the RPC client

Here's an example of how to use the Kaspa RPC Client library:

### Step 1: Import `ClientWrapper`

```typescript
const { ClientWrapper } = require("kaspa-rpc-client")
```

### Step 2: Initialize `ClientWrapper`

You can pass multiple hosts to the wrapper, the wrappper will figure out which one to use. You can also enable the verbose log by `verbose: true`

```typescript
const wrapper = new ClientWrapper({
  hosts: ["seeder2.kaspad.net:16110"],

  verbose: true,
})

await wrapper.initialize()
```

### Step 3: Get client from the pool

The `.getClient()` method ensures that you will always get the server that is ready to handle requests

```typescript
const client = await wrapper.getClient()
```

### Step 4: Make RPC calls

#### Get a block by hash

```typescript
const block = await client.getBlock({
  hash: "6ef1913d30316304254aa5ce6c34ff9dd2b519231bb80194d4b5e5449412e924",

  includeTransactions: true,
})
```

#### Get unspent transaction outputs (UTXOs) for a list of addresses

```typescript
const utxos = await client.getUtxosByAddresses({
  addresses: [
    "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
  ],
})
```

#### Get balance by address

```typescript
const balance = await client.getBalanceByAddress({
  address:
    "kaspa:qrrzeucwfetuty3qserqydw4z4ax9unxd23zwp7tndvg7cs3ls8dvwldeayv5",
})
```

#### Subscribe to `UtxosChangedNotification`

All listener methods will return a uid where you can call its corresponding unsubscribe method to stop the listener.

```typescript
const { uid } = client.subscribeUtxosChanged(
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

client.unsubscribeUtxosChanged(uid) // This cancels the listener
```

Full example code can be found in [demo/rpc.ts](https://github.com/Cryptok777/kaspa-rpc-client/blob/main/demo/rpc.ts). Refer to the [API doc for all available methods](https://cryptok777.github.io/kaspa-rpc-client/classes/lib_Client.Client.html).

You can also find [interface for all requests/response](https://cryptok777.github.io/kaspa-rpc-client/modules/types_custom_types.RPC.html), but it's likely that your IDE will show this information for you since it's written in TypeScript

## [NEW] Use Kaspa Wallet APIs

> Disclaimer: This is a preview version and for demo & research purpose only. It's not ready for production yet. Please use it at your own risk.

We built a super simple wallet interface, using the WASM library, let you create, manage the wallet and send transactions with zero effort.

### Wallet APIs

To create a wallet, you will need to pass in the `client`, as it's needed to make RPC calls to the Kaspa network and fetch data and submit transaction.

It's recommended to use the `ClientWrapper` to get the client, however you can also implement your own client, as long as it implements the [`ClientProvider` interface](https://github.com/Cryptok777/kaspa-rpc-client/blob/main/lib/ClientProvider.ts).

#### First, create a new client so the Wallet class can use it

```typescript
const { ClientWrapper, Wallet } = require("kaspa-rpc-client")

const wrapper = new ClientWrapper({
  hosts: ["seeder2.kaspad.net:16110"],
})
await wrapper.initialize()
const client = await wrapper.getClient()
```

#### Create a Wallet

##### With random mnemonic

```typescript
const { phrase, entropy } = Wallet.randomMnemonic()
const wallet = Wallet.fromPhrase(client, phrase)
```

##### From mnemonic

```typescript
const wallet = Wallet.fromPhrase(client, "YOUR_MNEMONIC")
```

##### From seed, without passpharse

```typescript
const wallet = Wallet.fromSeed(client, "YOUR_SEED")
```

##### From xPrv (master private key)

```typescript
const wallet = Wallet.fromPrivateKey(client, "YOUR_XPRV")
```

#### Derive an Account from a Wallet

You can pass in the account index, as `Bigint` to derive the account, the default index is `0n`.

```typescript
const account = await wallet.account()
const account_99 = await wallet.account(BigInt(99))
```

### Account APIs

#### Derive an Account

A `Wallet` can have many `Accounts`.

It's recommended to use the `Wallet.account()` to derive an account, see more details in the `Wallet APIs` section. However you can also use `Account.fromPhrase()`, `Account.fromSeed()` or `Account.fromPrivateKey()` to import an account. See [API doc](https://cryptok777.github.io/kaspa-rpc-client/classes/lib_Account.Account.html#fromPhrase) for more details.

#### Derive Addresses from an Account
An `Account` can have many `Addresses`, with different types (`Receive`, `Change`)

You can use `Account.address()` or `Account.addresses()` to derive addresses from an `Account`, the address index is integer.

See the following examples:

```typescript
const { AddressType, Wallet, ClientWrapper } = require("kaspa-rpc-client")

const wrapper = new ClientWrapper({
  hosts: ["seeder2.kaspad.net:16110"],
})
await wrapper.initialize()
const client = await wrapper.getClient()

const { phrase, entropy } = Wallet.randomMnemonic()
const wallet = Wallet.fromPhrase(client, phrase)

const account = await wallet.account()

const address1 = await account.address() // Derive 1 Receive address, default index is 0
const address2 = await account.address(1) // Derive 1 Receive address at index 1
const address3 = await account.address(2, AddressType.Change) // Derive 1 Change address at index 2

const addresses = await account.addresses(0, 10) // Derive 10 Receive addresses, starting from index 0
const addresses2 = await account.addresses(0, 10, AddressType.Change) // Derive 10 Change addresses, starting from index 0
```

#### Send a transaction

To send a transcation from an `Account`, define the outputs and the change address, then call the `send()` method.

`Account.send()` method will scan for all available UTXOs from the account, and select the UTXOs that are enough to cover the transaction amount and fee. If there are not enough UTXOs, it will throw an error.

```typescript
const tx = await account.send({
  outputs: [
    {
      recipient: "ADDRESS_1",
      amount: BigInt(1 * 1e8),
    },
    {
      recipient: "ADDRESS_2",
      amount: BigInt(2 * 1e8),
    },
  ],
  changeAddress: "CHANGE_ADDRESS",
  fee: BigInt(1000), // optional, if not passed, the fee will be calculated automatically
  priorityFee: 1000, // optional, default is 0
})
```

`amount` and `fee` should be `BigInt`, and the unit is sompi, `priorityFee` should be integer, and the unit is sompi.

`Account.sendAll()` sends all available UTXOs to the specified address.

```typescript
const tx = await account.sendAll({
  recipient: "SOME_ADDRESS",
  fee: BigInt(1000), // optional, if not passed, the fee will be calculated automatically
  priorityFee: 1000, // optional, default is 0
})
```

`Account.compound()` works similarly to `Account.sendAll()`, and will send all available UTXOs first Recieve address in the `Account`, if `destination` is not specified

```typescript
const tx = await account.compound()

// or you can compound to a specific address
const address1 = await account.address(1)
const tx2 = await account.compound(address1)
```

#### Get balance and available UTXOs for an Account

```typescript
const balance = await account.balance()
const utxos = await account.utxos()
```

### Address APIs

#### Derive an Address

An `Account` can have many `Addresses`, with different types (`Receive`, `Change`)

It's recommended to use `Account.address()` to derive an `Address`, see more details in the `Account APIs` section.

#### Send a transaction

To send a transcation from an `Address`, define the outputs and the change address, then call the `send()` method.

`Address.send()` will scan for all available UTXOs from the address, and select the UTXOs that are enough to cover the transaction amount and fee. If there are not enough UTXOs, it will throw an error.

See the following examples:

```typescript
const { Wallet, ClientWrapper } = require("kaspa-rpc-client")

const wrapper = new ClientWrapper({
  hosts: ["seeder2.kaspad.net:16110"],
})
await wrapper.initialize()
const client = await wrapper.getClient()

const { phrase, entropy } = Wallet.randomMnemonic()
const wallet = Wallet.fromPhrase(client, phrase)

const account = await wallet.account()
const address = await account.address()

const tx = await address.send({
  outputs: [
    {
      recipient: "ADDRESS_1",
      amount: BigInt(1 * 1e8),
    },
    {
      recipient: "ADDRESS_2",
      amount: BigInt(2 * 1e8),
    },
  ],
  changeAddress: "CHANGE_ADDRESS", // optional, if not passed, the change will be sent to the address itself
  fee: BigInt(1000), // optional, if not passed, the fee will be calculated automatically
  priorityFee: 1000, // optional, default is 0
})
```

`amount` and `fee` should be `BigInt`, and the unit is sompi, `priorityFee` should be integer, and the unit is sompi.

`Address.sendAll()` sends all available UTXOs to the specified address.

```typescript
const tx = await address.sendAll({
  recipient: "SOME_ADDRESS",
  fee: BigInt(1000), // optional, if not passed, the fee will be calculated automatically
  priorityFee: 1000, // optional, default is 0
})
```

#### Get balance and available UTXOs for an Address

```typescript
const balance = await address.balance()
const utxos = await address.utxos()
```

The above should cover most of the use cases. If you need more advanced features, check out the [full API doc](https://cryptok777.github.io/kaspa-rpc-client/classes/lib_Wallet.Wallet.html) for more details.

You can also checkout [demo/wallet.ts](https://github.com/Cryptok777/kaspa-rpc-client/blob/main/demo/wallet.ts) for full working example.

## Known Bugs
- [ ] When the transaction contains too many inputs, e.g. when calling `sendAll`, therefore the mass of the transaction is too large, the transaction will be rejected by the network. You can workaround by splitting the transaction into multiple smaller transactions.
- [ ] It doesn't track the in-use UXTOs, so when you send a transcation using some UTXOs, and try to send another transaction right after, the node might still return the same set of UTXOs that are already being used, therefore the transaction will be rejected by the network. You can workaround by waiting for a few seconds before sending the next transaction.
- [ ] There is a bug in the WASM lib when calculating the `minimumTransactionFee`, so the estimated fee is always lower than actual fee. We doubled the estimated fee to workaround this issue, most likely that the actual fee will be lower, any change will be sent back to the sender.
## Full API Docs

Full references of the classes/interfaces can be found [here](https://cryptok777.github.io/kaspa-rpc-client/)
## Contribute

If you find that the RPC endpoint you are looking for is not exposed by the client library, feel free to create a pull request to add it:

1. Run `./scripts/update-proto.sh` to fetch the latest proto files from the Kaspad repo. This will automatically generate the TypeScript interfaces for you

2. Copy the request/response interfaces that you would like to add to `./types/rpc.d.ts`

3. Expose the method with the typed interfaces from the last step in `./lib/Client.ts`

## Donation

This project is built by the team that brought you [Kas.fyi](https://kas.fyi/). If you find this library useful, feel free to donate to `kaspa:qpnsy5fc592kcnu6vnx8aknskhmu6x9qksec084v043pjk5hur6vw9e87wpg2`. Your support is greatly appreciated!
