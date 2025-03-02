#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ethers = require('ethers');
const solc = require('solc');
const colors = require('colors');

const chain = require('../../../utils/chain');

// Load wallets from utils/wallets.json
const walletsPath = path.resolve(__dirname, '../../../utils/wallets.json');
let wallets = [];
try {
  wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
} catch (error) {
  console.error("Error reading wallets.json".red, error);
  process.exit(1);
}

(async () => {
  // Prompt for wallet selection
  const { walletChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletChoice',
      message: 'Select the wallet(s) to deploy the NFT contract:',
      choices: [
        { name: '1. All wallets', value: 'all' },
        { name: '2. Specific IDs', value: 'specific' }
      ]
    }
  ]);

  let selectedWallets = [];
  if (walletChoice === 'all') {
    selectedWallets = wallets;
  } else {
    const { walletIDs } = await inquirer.prompt([
      {
        type: 'input',
        name: 'walletIDs',
        message: 'Enter wallet IDs separated by spaces (e.g., 1 3 5):'
      }
    ]);
    const ids = walletIDs.trim().split(/\s+/).map(id => parseInt(id)).filter(id => !isNaN(id));
    selectedWallets = wallets.filter(w => ids.includes(w.id));
  }

  if (selectedWallets.length === 0) {
    console.log("⚠️  No wallets selected for deployment.".yellow);
    process.exit(0);
  }

  // Prompt for NFT collection details
  const nftDetails = await inquirer.prompt([
    {
      type: 'input',
      name: 'collectionName',
      message: 'Enter NFT Collection Name:'
    },
    {
      type: 'input',
      name: 'ticket',
      message: 'Enter NFT Ticket (Symbol):'
    },
    {
      type: 'input',
      name: 'maxSupply',
      message: 'Enter Maximum Supply to mint:',
      validate: (input) => {
        return (!isNaN(input) && parseInt(input) > 0) ? true : "Please enter a valid number greater than 0";
      }
    }
  ]);
  const maxSupply = parseInt(nftDetails.maxSupply);

  // Read and compile nft.sol
  const nftPath = path.resolve(__dirname, 'nft.sol');
  const nftSource = fs.readFileSync(nftPath, 'utf8');

  const inputJSON = {
    language: 'Solidity',
    sources: {
      'nft.sol': { content: nftSource }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const compiled = JSON.parse(solc.compile(JSON.stringify(inputJSON)));
  if (compiled.errors) {
    let fatal = false;
    compiled.errors.forEach(err => {
      console.error(err.formattedMessage.red);
      if (err.severity === 'error') fatal = true;
    });
    if (fatal) process.exit(1);
  }

  const nftContractNames = Object.keys(compiled.contracts['nft.sol']);
  if (nftContractNames.length === 0) {
    console.error("❌ No NFT contract found in nft.sol".red);
    process.exit(1);
  }
  const nftContractName = nftContractNames[0];
  const nftData = compiled.contracts['nft.sol'][nftContractName];
  const nftABI = nftData.abi;
  const nftBytecode = nftData.evm.bytecode.object;

  // Create a provider using the chain's RPC URL
  const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);

  // Prepare data.json file (to record NFT collection deployments)
  const dataFile = path.resolve(__dirname, 'data.json');
  let data = [];
  if (fs.existsSync(dataFile)) {
    try {
      data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (err) {
      console.error("Error reading data.json".red, err);
    }
  }

  // For each selected wallet, deploy the NFT contract
  for (const walletInfo of selectedWallets) {
    console.log(`\nDeploying NFT Collection from wallet: [${walletInfo.address}]`.green);
    const wallet = new ethers.Wallet(walletInfo.privateKey, provider);

    try {
      // Calculate fees
      const block = await provider.getBlock('latest');
      const baseFee = block.baseFeePerGas ? block.baseFeePerGas : ethers.BigNumber.from(0);
      const maxFeePerGas = baseFee.mul(115).div(100);
      const maxPriorityFeePerGas = baseFee.mul(115).div(100);
      const gasLimit = Math.floor(Math.random() * (850000 - 750000 + 1)) + 750000;

      const factory = new ethers.ContractFactory(nftABI, nftBytecode, wallet);
      const nftContract = await factory.deploy(
        nftDetails.collectionName,
        nftDetails.ticket,
        maxSupply,
        {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        }
      );

      console.log(`🚀 Deploy Tx Sent! - ${chain.TX_EXPLORER}${nftContract.deployTransaction.hash}`.magenta);
      const receipt = await nftContract.deployTransaction.wait();
      console.log(`🏠 NFT Contract successfully Deployed at - ${chain.ADDRESS_EXPLORER}${nftContract.address}\n`.magenta);

      // Generate deployment data for data.json
      // Determine the counter for this wallet's deployments
      let walletDeployments = data.filter(item => item.deployer_address.toLowerCase() === wallet.address.toLowerCase());
      let newId = walletDeployments.length + 1;
      let newEntry = {
        id: newId,
        deployer_address: wallet.address,
        collection_name: nftDetails.collectionName,
        max_supply: maxSupply,
        collection_symbol: nftDetails.ticket
      };
      data.push(newEntry);
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
      console.log("Deployment data saved to data.json".green);
    } catch (error) {
      if (
        (error.message && error.message.includes("insufficient balance")) ||
        error.code === -32603 ||
        (error.message && error.message.includes("CALL_EXCEPTION"))
      ) {
        const balanceBN = await wallet.getBalance();
        const formattedBalance = ethers.utils.formatEther(balanceBN);
        console.error(`❌ Wallet - [${walletInfo.address}] is out of funds to deploy this NFT. Balance [${formattedBalance}] ${chain.SYMBOL}`.red);
      } else {
        console.error(`❌ Error deploying NFT contract with wallet ID ${walletInfo.id}: ${error.message}`.red);
      }
    }
  }
})();
