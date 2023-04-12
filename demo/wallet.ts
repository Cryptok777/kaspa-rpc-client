const { ClientWrapper, Wallet } = require('kaspa-rpc-client')

const MNEMONIC = {
  phrase: 'INSERT_MNEMNIC_PHRASE_HERE'
}

const HOST = "seeder2.kaspad.net:16110"

const addressTest = async () => {
  const wrapper = new ClientWrapper({
    hosts: [HOST],
  })

  await wrapper.initialize()
  const client = await wrapper.getClient()


  const wallet = Wallet.fromPhrase(client, MNEMONIC.phrase)
  const account = await wallet.account()
  const address1 = await account.address()
  const address2 = await account.address(1)

  console.log('===== Before Send =====');
  let balance1 = await address1.balance()
  let balance2 = await address2.balance()
  console.log(`address 1 balance: ${balance1}`);
  console.log(`address 2 balance: ${balance2}`);

  // Test 1 - send()
  console.log('==== Sending tx from a1 to a2 =====');

  const outputs = [...Array(1)].fill(0).map((_, index) => {
    return {
      recipient: address2,
      amount: BigInt(0.1 * 1e8 + index)
    }
  })

  const tx = await address1.send({
    outputs
  })

  console.log(tx);

  console.log(`TX sent, waiting for 7s before refreshing balance`);
  await new Promise(r => setTimeout(r, 7000));

  console.log('===== Afer Send =====');
  balance1 = await address1.balance()
  balance2 = await address2.balance()
  console.log(`address 1 balance: ${balance1}`);
  console.log(`address 2 balance: ${balance2}`);

  // Test 2 - sendAll()
  console.log('==== Sending all from a1 to a2 =====');

  const tx2 = await address1.sendAll({
    recipient: address2,
  })

  console.log(tx2);

  console.log(`TX sent, waiting for 7s before refreshing balance`);
  await new Promise(r => setTimeout(r, 7000));

  console.log('===== Afer Send =====');
  balance1 = await address1.balance()
  balance2 = await address2.balance()
  console.log(`address 1 balance: ${balance1}`);
  console.log(`address 2 balance: ${balance2}`);

  console.log('==== Sending all from a2 to a1 =====');


  // Test 3 - sendAll()
  const tx3 = await address2.sendAll({
    recipient: address1,
  })

  console.log(tx3);

  console.log(`TX sent, waiting for 7s before refreshing balance`);
  await new Promise(r => setTimeout(r, 7000));

  console.log('===== Afer Send =====');
  balance1 = await address1.balance()
  balance2 = await address2.balance()
  console.log(`address 1 balance: ${balance1}`);
  console.log(`address 2 balance: ${balance2}`);

}

const accountTest = async () => {
  const wrapper = new ClientWrapper({
    hosts: [HOST],
  })

  await wrapper.initialize()
  const client = await wrapper.getClient()

  const wallet = Wallet.fromPhrase(client, MNEMONIC.phrase)

  const account1 = await wallet.account()
  const address1_1 = await account1.address()
  const address1_2 = await account1.address(1)

  const account2 = await wallet.account(99n)
  const address2_1 = await account2.address()
  const address2_2 = await account2.address(1)

  let balance1 = await account1.balance()
  let balance2 = await account2.balance()

  console.log('========= Before Send =======');
  console.log(`account 1 balance: ${balance1}`);
  console.log(`account 2 balance: ${balance2}`);

  console.log('====== Send tx between account =======');

  // Test 1 - Account.send()
  const tx = await account1.send({
    outputs: [{
      recipient: address2_1,
      amount: BigInt(0.01 * 1e8),
    }, {
      recipient: address2_2,
      amount: BigInt(0.02 * 1e8),
    }],
    changeAddress: address1_1,
  })

  console.log(tx);
  console.log(`TX sent, waiting for 7s before refreshing balance`);
  await new Promise(r => setTimeout(r, 7000));

  console.log('===== After Send =====');
  balance1 = await account1.balance()
  balance2 = await account2.balance()
  console.log(`account 1 balance: ${balance1}`);
  console.log(`account 2 balance: ${balance2}`);

  // Test 2 - Account.sendAll()
  const tx2 = await account1.sendAll({
    recipient: address2_1
  })

  console.log(tx2);
  console.log(`TX sent, waiting for 7s before refreshing balance`);
  await new Promise(r => setTimeout(r, 7000));

  console.log('===== After Send =====');
  balance1 = await account1.balance()
  balance2 = await account2.balance()
  console.log(`account 1 balance: ${balance1}`);
  console.log(`account 2 balance: ${balance2}`);

  // Test 3 - Account.sendAll()
  const tx3 = await account2.sendAll({
    recipient: address1_1
  })

  console.log(tx3);
  console.log(`TX sent, waiting for 7s before refreshing balance`);
  await new Promise(r => setTimeout(r, 7000));

  console.log('===== After Send =====');
  balance1 = await account1.balance()
  balance2 = await account2.balance()
  console.log(`account 1 balance: ${balance1}`);
  console.log(`account 2 balance: ${balance2}`);
}

  ; (async () => {
    await addressTest()
    await accountTest()
  })()