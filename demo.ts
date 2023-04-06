const { KaspadClientWrapper, KaspadWallet } = require('kaspa-rpc-client')

const run = async () => {


  const a = {
  }
  console.log(a);


  const address = await KaspadWallet.mnemonicToSeed(a.phrase, "password")
  // console.log(c);



  // Initilize the clients
  const wrapper = new KaspadClientWrapper({

    // verbose: true,
  })

  await wrapper.initialize()

  // Get one client from the pool
  const client = await wrapper.getClient()

  const balance = await client.getBalanceByAddress({ address })
  console.log(balance);

  // Step 1: get all available UTXOs
  const utxos = await client.getUtxosByAddresses({ addresses: [address] })
  console.log(JSON.stringify(utxos, null, 4));

  const tempUtxos = {
    "entries": [
      {
        "address": "kaspa:qpc0f3mhherpp026zfng3sq5j3gkqswacjv8wlvpf2v48k863fpluhpt0tkqj",
        "outpoint": {
          "transactionId": "59eba628955546b1a52828320c6b9fd0adcda3ef7c585ee0d5e81b2602c9f746",
          "index": 0
        },
        "utxoEntry": {
          "amount": BigInt("10000"),
          "scriptPublicKey": {
            "version": 0,
            "scriptPublicKey": "2070f4c777be4610bd5a126688c01494516041ddc498777d814a9953d8fa8a43feac"
          },
          "blockDaaScore": "44302564",
          "isCoinbase": false
        }
      }
    ],
    "error": null
  }

  // Step 2: Create utxo set
  let utxoSet = KaspadWallet.getUtxoSet(tempUtxos)
  console.log(utxoSet);



  // client.subscribeUtxosChanged({ addresses: ['kaspa:qpc0f3mhherpp026zfng3sq5j3gkqswacjv8wlvpf2v48k863fpluhpt0tkqj'] }, (res) => {
  //   console.log(JSON.stringify(res, null, 4));
  // })

  // const val = await client.getBlock({hash: "8586ca39ac7a742aa93cdbb6489ec596fdfb568e34da3180bbcbf3b8f215c557", includeTransactions: true})
  // console.log(val);

  // client.subscribeVirtualSelectedParentBlueScoreChanged((aa) => {
  //   console.log(aa.virtualSelectedParentBlueScore);
  // })
}

  ; (async () => {
    await run()
  })()