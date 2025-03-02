#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ethers = require('ethers');
const solc = require('solc');
const colors = require('colors');

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

inquirer
  .prompt([
    {
      type: 'list',
      name: 'walletChoice',
      message: 'On which wallets would you like to deploy a token?',
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

    // Read and compile token.sol
    const tokenPath = path.resolve(__dirname, 'token.sol');
    const tokenSource = fs.readFileSync(tokenPath, 'utf8');
    const input = {
      language: 'Solidity',
      sources: {
        'token.sol': { content: tokenSource },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode'],
          },
        },
      },
    };

    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
    if (compiled.errors) {
      let fatal = false;
      compiled.errors.forEach((err) => {
        console.error(err.formattedMessage.red);
        if (err.severity === 'error') fatal = true;
      });
      if (fatal) process.exit(1);
    }

    const tokenContractNames = Object.keys(compiled.contracts['token.sol']);
    if (tokenContractNames.length === 0) {
      console.error('❌ No token contract found in token.sol'.red);
      process.exit(1);
    }
    // Assume the first contract is our token
    const tokenContractName = tokenContractNames[0];
    const tokenData = compiled.contracts['token.sol'][tokenContractName];
    const tokenABI = tokenData.abi;
    const tokenBytecode = tokenData.evm.bytecode.object;

    // For each selected wallet, prompt for token details and deploy
    for (const walletInfo of selectedWallets) {
      console.log(`\n🏦 Wallet - [${walletInfo.address}]`);
      const tokenDetails = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter Token Name:',
        },
        {
          type: 'input',
          name: 'symbol',
          message: 'Enter Token Symbol:',
        },
        {
          type: 'input',
          name: 'totalSupply',
          message: 'Enter Total Supply:',
        },
        {
          type: 'input',
          name: 'decimals',
          message: 'Enter Decimals:',
          default: '18',
        },
      ]);

      const decimals = parseInt(tokenDetails.decimals);
      let totalSupplyBN;
      try {
        totalSupplyBN = ethers.utils.parseUnits(tokenDetails.totalSupply, decimals);
      } catch (err) {
        console.error('Invalid total supply input.'.red);
        continue;
      }

      const wallet = new ethers.Wallet(walletInfo.privateKey, provider);

      try {
        console.log(
          `Deploying Token Contract with parameters: Name: ${tokenDetails.name}, Symbol: ${tokenDetails.symbol}, Total Supply: ${tokenDetails.totalSupply}, Decimals: ${decimals}`.green
        );

        // Calculate fees: gasLimit, maxFeePerGas, and maxPriorityFeePerGas
        const block = await provider.getBlock('latest');
        const baseFee = block.baseFeePerGas ? block.baseFeePerGas : ethers.BigNumber.from(0);
        const maxFeePerGas = baseFee.mul(115).div(100);
        const maxPriorityFeePerGas = baseFee.mul(115).div(100);
        const gasLimit = Math.floor(Math.random() * (1500000 - 950000 + 1)) + 950000;

        const factory = new ethers.ContractFactory(tokenABI, tokenBytecode, wallet);
        const tokenContract = await factory.deploy(
          tokenDetails.name,
          tokenDetails.symbol,
          decimals,
          totalSupplyBN,
          {
            gasLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
          }
        );

        console.log(
          `🚀 Deploy Tx Sent! - ${chain.TX_EXPLORER}${tokenContract.deployTransaction.hash}`.magenta
        );
        const receipt = await tokenContract.deployTransaction.wait();
        console.log(
          `🏠 Token Contract successfully Deployed at - ${chain.ADDRESS_EXPLORER}${tokenContract.address}\n`.magenta
        );
      } catch (error) {
        if (
          (error.message && error.message.includes('insufficient balance')) ||
          error.code === -32603 ||
          (error.message && error.message.includes('CALL_EXCEPTION'))
        ) {
          const balanceBN = await wallet.getBalance();
          const formattedBalance = ethers.utils.formatEther(balanceBN);
          console.error(
            `❌ Wallet - [${walletInfo.address}] is out of funds to deploy this token. Balance [${formattedBalance}] ${chain.SYMBOL}`.red
          );
        } else {
          console.error(
            `❌ Error deploying token contract with wallet ID ${walletInfo.id}: ${error.message}`.red
          );
        }
      }
    }
  })
  .catch((err) => {
    console.error('❌ An error occurred:', err.message.red);
  });
