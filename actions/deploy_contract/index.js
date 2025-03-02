#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ethers = require('ethers');
const colors = require('colors');
const solc = require('solc');

// Load chain configuration
const chain = require('../../utils/chain');

// Load wallets from utils/wallets.json
const walletsPath = path.resolve(__dirname, '../../utils/wallets.json');
let wallets = [];
try {
  wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
} catch (error) {
  console.error('Error reading wallets.json'.red, error);
  process.exit(1);
}

// Read the Solidity source file
const contractsPath = path.resolve(__dirname, 'contracts.sol');
const source = fs.readFileSync(contractsPath, 'utf8');

// Prepare Solidity compiler input
const input = {
  language: 'Solidity',
  sources: {
    'contracts.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

// Compile contracts (no "Compiling contracts" message)
const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for compilation errors
if (compiled.errors) {
  let fatal = false;
  compiled.errors.forEach((err) => {
    console.error(err.formattedMessage.red);
    if (err.severity === 'error') fatal = true;
  });
  if (fatal) process.exit(1);
}

// Get all contract names from the compilation output
const contractNames = Object.keys(compiled.contracts['contracts.sol']);
if (contractNames.length === 0) {
  console.error('❌ No contracts found in compilation.'.red);
  process.exit(1);
}

// Helper: Return constructor arguments based on contract name
function getConstructorArgs(contractName) {
  switch (contractName) {
    case 'SimpleStorage':
      return [0];
    case 'SimpleCounter':
      return [];
    case 'Greeter':
      return ["Hello"];
    case 'Ownable':
      return [];
    case 'HelloWorld':
      return [];
    case 'BasicCalculator':
      return [];
    case 'DataStore':
      return [123];
    case 'EmptyContract':
      return [];
    case 'SimpleEvent':
      return [];
    case 'SimpleLogger':
      return [];
    default:
      return [];
  }
}

inquirer
  .prompt([
    {
      type: 'list',
      name: 'walletChoice',
      message: 'On what addresses would you like to deploy a contract?',
      choices: [
        { name: '1. All wallets', value: 'all' },
        { name: '2. Specific IDs', value: 'specific' },
      ],
    },
  ])
  .then(async (answers) => {
    let selectedWallets = [];
    if (answers.walletChoice === 'all') {
      selectedWallets = wallets;
    } else {
      const { walletIDs } = await inquirer.prompt([
        {
          type: 'input',
          name: 'walletIDs',
          message: 'Enter wallet IDs separated by spaces (e.g., 1 3 5):',
        },
      ]);
      const ids = walletIDs
        .trim()
        .split(/\s+/)
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      selectedWallets = wallets.filter((w) => ids.includes(w.id));
    }

    if (selectedWallets.length === 0) {
      console.log('⚠️  No wallets selected for deployment.'.yellow);
      process.exit(0);
    }

    // Create a provider using the chain's RPC URL
    const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);

    // For each wallet, deploy one random contract from the list
    for (const walletInfo of selectedWallets) {
      // Create wallet instance outside try so it can be used in catch
      const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
      try {
        // Choose a random contract from the compiled list
        const randomIndex = Math.floor(Math.random() * contractNames.length);
        const selectedContractName = contractNames[randomIndex];
        const contractData =
          compiled.contracts['contracts.sol'][selectedContractName];
        const contractABI = contractData.abi;
        const contractBytecode = contractData.evm.bytecode.object;
        const constructorArgs = getConstructorArgs(selectedContractName);

        console.log(
          `\n🏦 Wallet - [${walletInfo.address}] is compiling contract [${selectedContractName}]`
            .green
        );
        console.log('✅ Contract Has been compiled.'.green);
        console.log('🔨 Preparing Deployment...'.cyan);

        // Retrieve latest block to get baseFeePerGas (if available)
        const block = await provider.getBlock('latest');
        const baseFee = block.baseFeePerGas
          ? block.baseFeePerGas
          : ethers.BigNumber.from(0);
        // Calculate fees: baseFee + 15%
        const maxFeePerGas = baseFee.mul(115).div(100);
        const maxPriorityFeePerGas = baseFee.mul(115).div(100);

        // Set a random gasLimit between 150,000 and 250,000
        const gasLimit =
          Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000;

        const factory = new ethers.ContractFactory(
          contractABI,
          contractBytecode,
          wallet
        );

        // Deploy the contract using its constructor arguments
        const contract = await factory.deploy(...constructorArgs, {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });

        console.log(
          `🚀 Deploy Tx Sent! - ${chain.TX_EXPLORER}${contract.deployTransaction.hash}`
            .magenta
        );

        const receipt = await contract.deployTransaction.wait();

        console.log(
          `🏠 Contract successfully Deployed at - ${chain.ADDRESS_EXPLORER}${contract.address}\n`
            .magenta
        );
      } catch (error) {
        if (
          (error.message && error.message.includes("insufficient balance")) ||
          error.code === -32603 ||
          (error.message && error.message.includes("CALL_EXCEPTION"))
        ) {
          const balanceBN = await wallet.getBalance();
          const formattedBalance = ethers.utils.formatEther(balanceBN);
          console.error(
            `❌ Wallet - [${walletInfo.address}] is out of funds to deploy this contract. Balance [${formattedBalance}] ${chain.SYMBOL}`.red
          );
        } else {
          console.error(
            `❌ Error deploying contract with wallet ID ${walletInfo.id}: ${error.message}`.red
          );
        }
      }
    }
  })
  .catch((err) => {
    console.error('❌ An error occurred:', err.message.red);
  });
