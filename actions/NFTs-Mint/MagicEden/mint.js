const inquirer = require('inquirer');
const { ethers } = require('ethers');
const chalk = require('chalk');
const figlet = require('figlet');

const abi = require('./ABI');
const { quoteMintData } = require('./scripts/apis');

const walletsList = require('../../../utils/wallets.json');
const chain = require('../../../utils/chain');

const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL, chain.CHAIN_ID);

function printBanner() {
  console.clear();
  console.log(chalk.green(figlet.textSync('MagicEden')));
}

function getAllWallets() {
  return walletsList;
}

async function mintNFT(nftContract, quantity, walletObj, totalPrice) {
  const signer = new ethers.Wallet(walletObj.privateKey, provider);
  const contract = new ethers.Contract(nftContract, abi, signer);
  const tx = await contract.mint(quantity, walletObj.address, { value: totalPrice });
  return tx;
}

async function processInBatches(items, batchSize, task) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(task));
  }
}

async function mintInstantly() {
  printBanner();
  const { nftContract } = await inquirer.prompt([
    { type: 'input', name: 'nftContract', message: 'Enter the NFT contract address:' }
  ]);

  const walletForQuote = walletsList[0].address;
  const mintData = await quoteMintData(nftContract, walletForQuote);
  const totalPrice = mintData.path[0].totalPrice;
  console.log(chalk.blue(`💰 Mint Price Obtained: [${totalPrice}]`));

  const { mintOption } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mintOption',
      message: 'Which wallet(s) would you like to mint NFTs on?',
      choices: ['All of them', 'Specific IDs']
    }
  ]);

  let selectedWallets = [];
  if (mintOption === 'All of them') {
    selectedWallets = getAllWallets();
  } else {
    const { walletIDs } = await inquirer.prompt([
      { type: 'input', name: 'walletIDs', message: 'Enter wallet IDs separated by spaces:' }
    ]);
    const ids = walletIDs.split(' ').map(id => Number(id));
    selectedWallets = walletsList.filter(wallet => ids.includes(wallet.id));
  }

  const { quantity } = await inquirer.prompt([
    { type: 'input', name: 'quantity', message: 'Enter quantity to mint (default 1):', default: '1' }
  ]);

  console.log(chalk.yellow('🔥 Minting in progress...'));

  await processInBatches(selectedWallets, 10, async walletObj => {
    console.log(chalk.cyan(`Wallet [${walletObj.address}] is minting ${quantity} NFT(s) 🚀`));
    try {
      const tx = await mintNFT(nftContract, quantity, walletObj, totalPrice);
      console.log(chalk.magenta(`🔗 [${chain.TX_EXPLORER}${tx.hash}] Sent from Wallet [${walletObj.address}]`));
      const receipt = await tx.wait();
      console.log(chalk.green(`✅ Transaction confirmed in Block [${receipt.blockNumber}] for wallet [${walletObj.address}]`));
    } catch (err) {
      console.log(chalk.red(`❌ Error minting from wallet [${walletObj.address}]: ${err.message}`));
    }
  });
}

async function scheduleMint() {
  printBanner();
  const { nftContract } = await inquirer.prompt([
    { type: 'input', name: 'nftContract', message: 'Enter the NFT contract address:' }
  ]);

  const walletForQuote = walletsList[0].address;
  const mintData = await quoteMintData(nftContract, walletForQuote);
  const totalPrice = mintData.path[0].totalPrice;
  console.log(chalk.blue(`💰 Mint Price Obtained: [${totalPrice}]`));

  const { mintOption } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mintOption',
      message: 'Which wallet(s) would you like to mint NFTs on?',
      choices: ['All of them', 'Specific IDs']
    }
  ]);

  let selectedWallets = [];
  if (mintOption === 'All of them') {
    selectedWallets = getAllWallets();
  } else {
    const { walletIDs } = await inquirer.prompt([
      { type: 'input', name: 'walletIDs', message: 'Enter wallet IDs separated by spaces:' }
    ]);
    const ids = walletIDs.split(' ').map(id => Number(id));
    selectedWallets = walletsList.filter(wallet => ids.includes(wallet.id));
  }

  const schedule = await inquirer.prompt([
    { type: 'input', name: 'hour', message: 'Insert Minting Schedule - HOUR (UTC):', default: '0' },
    { type: 'input', name: 'minute', message: 'MINUTE:', default: '0' },
    { type: 'input', name: 'second', message: 'SECOND:', default: '0' }
  ]);

  const now = new Date();
  let scheduledTime = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    Number(schedule.hour),
    Number(schedule.minute),
    Number(schedule.second)
  ));
  if (scheduledTime < now) {
    scheduledTime.setUTCDate(scheduledTime.getUTCDate() + 1);
  }
  const delay = scheduledTime.getTime() - now.getTime();
  console.log(chalk.yellow(`⏳ Mint scheduled in ${Math.floor(delay / 1000)} seconds.`));

  setTimeout(async () => {
    console.log(chalk.yellow('🔥 Scheduled minting started...'));
    await processInBatches(selectedWallets, 10, async walletObj => {
      console.log(chalk.cyan(`Wallet [${walletObj.address}] is minting 1 NFT 🚀`));
      try {
        const tx = await mintNFT(nftContract, 1, walletObj, totalPrice);
        console.log(chalk.magenta(`🔗 [${chain.TX_EXPLORER}${tx.hash}] Sent from Wallet [${walletObj.address}]`));
        const receipt = await tx.wait();
        console.log(chalk.green(`✅ Transaction confirmed in Block [${receipt.blockNumber}] for wallet [${walletObj.address}]`));
      } catch (err) {
        console.log(chalk.red(`❌ Error minting from wallet [${walletObj.address}]: ${err.message}`));
      }
    });
  }, delay);
}

async function main() {
  printBanner();
  console.log("")
  const { mintType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mintType',
      message: 'Select the minting option:',
      choices: ['Mint Instantly', 'Schedule Mint']
    }
  ]);

  if (mintType === 'Mint Instantly') {
    await mintInstantly();
  } else {
    await scheduleMint();
  }
}

main().catch(err => {
  console.log(chalk.red(`❌ ${err}`));
});
