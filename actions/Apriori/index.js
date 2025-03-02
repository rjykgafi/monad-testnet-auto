const inquirer = require('inquirer');
const chalk = require('chalk');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const chain = require('../../utils/chain');
const wallets = JSON.parse(fs.readFileSync(path.join(__dirname, '../../utils/wallets.json')));
const { APRMON_STAKE_CONTRACT, ABI } = require('./ABI');
const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL, chain.CHAIN_ID);
const contract = new ethers.Contract(APRMON_STAKE_CONTRACT, ABI, provider);

async function getGasOverrides() {
  const gasLimit = Math.floor(Math.random() * (250000 - 180000 + 1)) + 180000;
  const feeData = await provider.getFeeData();
  const baseFee = feeData.lastBaseFeePerGas ? feeData.lastBaseFeePerGas : feeData.gasPrice;
  const fee = baseFee.mul(105).div(100);
  return { gasLimit, maxFeePerGas: fee, maxPriorityFeePerGas: fee };
}

async function main() {
  console.log(chalk.cyan("🔹 What would you like to do?"));
  const { action } = await inquirer.prompt([
    { type: 'list', name: 'action', message: 'Select an option:', choices: ['Stake MON', 'Unstake MON', 'Claim Unstaked MON'] }
  ]);
  console.log(chalk.cyan("🔹 On which wallets would you like to perform these Tx's?"));
  const { walletOption } = await inquirer.prompt([
    { type: 'list', name: 'walletOption', message: 'Select wallet option:', choices: ['All of them', 'Specific IDs'] }
  ]);
  let selectedWallets = [];
  if (walletOption === 'All of them') {
    selectedWallets = wallets;
  } else {
    const { walletIDs } = await inquirer.prompt([
      { type: 'input', name: 'walletIDs', message: 'Enter wallet IDs separated by space:' }
    ]);
    const ids = walletIDs.split(' ').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    selectedWallets = wallets.filter(w => ids.includes(w.id));
  }
  if (selectedWallets.length === 0) {
    console.log(chalk.cyan("\n⚠️  No wallets selected. Exiting."));
    return;
  }
  if (action === 'Stake MON') {
    const { minStake, maxStake } = await inquirer.prompt([
      { type: 'input', name: 'minStake', message: 'Min amount to Stake?', validate: input => !isNaN(parseFloat(input)) && parseFloat(input) > 0 ? true : "Enter a valid number" },
      { type: 'input', name: 'maxStake', message: 'Max amount to Stake?', validate: input => !isNaN(parseFloat(input)) && parseFloat(input) > 0 ? true : "Enter a valid number" }
    ]);
    for (const walletInfo of selectedWallets) {
      const { address, privateKey } = walletInfo;
      const randomAmount = (Math.random() * (parseFloat(maxStake) - parseFloat(minStake)) + parseFloat(minStake)).toFixed(3);
      console.log(chalk.cyan(`💼 Using Wallet - [${address}]`));
      console.log(chalk.green(`💰 Staking [${randomAmount} ${chain.SYMBOL}]`));
      const signer = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(signer);
      const overrides = await getGasOverrides();
      const amountWei = ethers.utils.parseUnits(randomAmount, 18);
      try {
        const tx = await contractWithSigner.deposit(amountWei, address, { value: amountWei, ...overrides });
        console.log(chalk.cyan(`🚀 Staking Tx Sent! - [${chain.TX_EXPLORER}${tx.hash}]`));
        const receipt = await tx.wait();
        console.log(chalk.green(`✅ Tx Confirmed in Block - [${receipt.blockNumber}]`));
        const receivedAPRMON = receipt.logs && receipt.logs[0] ? ethers.utils.formatUnits(receipt.logs[0].data, 18) : randomAmount;
        console.log(chalk.cyan(`🎉 Received [${receivedAPRMON} APRMON]\n`));
      } catch (error) {
        console.log(chalk.cyan(`⚠️  Error staking with wallet ${address}: ${error.message}\n`));
      }
    }
  } else if (action === 'Unstake MON') {
    for (const walletInfo of selectedWallets) {
      const { address, privateKey } = walletInfo;
      const signer = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(signer);
      try {
        const balanceBN = await contractWithSigner.balanceOf(address);
        if (balanceBN.eq(0)) {
          console.log(chalk.cyan(`\n💼 Using Wallet - [${address}]`));
          console.log(chalk.green(`💰 Unstaking - [0 APRMON] (No balance)`));
          continue;
        }
        const balanceAPRMON = ethers.utils.formatUnits(balanceBN, 18);
        console.log(chalk.cyan(`\n💼 Using Wallet - [${address}]`));
        console.log(chalk.green(`💰 Unstaking - [${balanceAPRMON} APRMON]`));
        const overrides = await getGasOverrides();
        const tx = await contractWithSigner.requestRedeem(balanceBN, address, address, overrides);
        console.log(chalk.cyan(`🚀 Unstake Tx Sent! - [${chain.TX_EXPLORER}${tx.hash}]`));
        const receipt = await tx.wait();
        console.log(chalk.green(`✅ Tx Confirmed in Block - [${receipt.blockNumber}]\n`));
      } catch (error) {
        console.log(chalk.cyan(`⚠️  Error unstaking with wallet ${address}: ${error.message}\n`));
      }
    }
  } else if (action === 'Claim Unstaked MON') {
    console.log(chalk.cyan("🔹 Coming Soon..."));
  }
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(chalk.cyan(`\n⚠️  ${error}\n`));
    process.exit(1);
  });
