 // actions/Kintzu/index.js

const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const {
  RPC_URL,
  TX_EXPLORER,
  CHAIN_ID,
  SYMBOL
} = require("../../utils/chain.js");
const walletsData = require("../../utils/wallets.json");
const { KINTZU_ABI, SMON_STAKE_CONTRACT } = require("./ABI.js");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function mainMenu() {
  console.clear();
  console.log(chalk.magenta("🌟 KINTZU STAKING MENU"));

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Select an option:",
      choices: [
        { name: "Stake MON", value: "stake" },
        { name: "Unstake MON (Coming soon...)", value: "unstake" },
        { name: "Exit", value: "exit" }
      ]
    }
  ]);

  if (action === "exit") {
    console.log(chalk.green("Exiting..."));
    return;
  }

  if (action === "stake") {
    const { whichAddrs } = await inquirer.prompt([
      {
        type: "list",
        name: "whichAddrs",
        message: "On which address would you like to perform txs?",
        choices: [
          { name: "All of them", value: "all" },
          { name: "Specific IDs", value: "specific" }
        ]
      }
    ]);

    let selectedWallets = [];
    if (whichAddrs === "all") {
      selectedWallets = walletsData;
    } else {
      const { idsInput } = await inquirer.prompt([
        {
          type: "input",
          name: "idsInput",
          message: "Enter wallet IDs (e.g. 1 2 3):"
        }
      ]);
      const parsedIds = idsInput
        .split(" ")
        .map((str) => str.trim())
        .filter(Boolean)
        .map(Number);
      selectedWallets = walletsData.filter((w) =>
        parsedIds.includes(w.id)
      );
    }

    if (selectedWallets.length === 0) {
      console.log(chalk.magenta("No valid wallets found."));
      return;
    }

    await stakeFlow(selectedWallets);
  } else {
    console.log(chalk.magenta("Unstake MON is coming soon..."));
  }
}

async function stakeFlow(wallets) {
  const contract = new ethers.Contract(SMON_STAKE_CONTRACT, KINTZU_ABI, provider);

  for (const w of wallets) {
    const walletSigner = new ethers.Wallet(w.privateKey, provider);
    const balance = await provider.getBalance(w.address);
    const balanceEth = parseFloat(ethers.utils.formatEther(balance));
    const percentage = 0.03 + Math.random() * 0.05; // 3% to 8%
    let amountToStake = balanceEth * percentage;
    amountToStake = parseFloat(amountToStake.toFixed(2)); // Only 2 decimals
    const amountWei = ethers.utils.parseEther(amountToStake.toString());
    const gasLimit = randomBetween(150000, 250000);
    const feeData = await provider.getFeeData();
    const baseFee = feeData.maxFeePerGas || feeData.gasPrice;
    const maxFeePerGas = baseFee.mul(105).div(100);
    const maxPriorityFeePerGas = maxFeePerGas;

    console.log(
      chalk.green(
        `🔹 Wallet [${w.address}] is staking ${amountToStake.toFixed(6)} ${SYMBOL}`
      )
    );

    try {
      const tx = await contract
        .connect(walletSigner)
        .stake({
          value: amountWei,
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        });

      console.log(chalk.magenta(`⏳ Stake Tx sent! [${TX_EXPLORER}${tx.hash}]`));
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(chalk.green(`✅ Confirmed in block ${receipt.blockNumber}`));
      } else {
        console.log(chalk.red("Transaction reverted."));
      }
      const sMonBalance = await contract.balanceOf(w.address);
      console.log(
        chalk.magenta(
          `⭐ SMON balance: ${parseFloat(ethers.utils.formatEther(sMonBalance)).toFixed(6)}\n`
        )
      );
    } catch (err) {
      if (err.code === "CALL_EXCEPTION") {
        console.log(chalk.red("Call exception occurred."));
      } else {
        console.log(chalk.red(`Error: ${err.message}`));
      }
    }
  }
}

mainMenu().catch((err) => {
  console.log(chalk.red(`Error: ${err.message}`));
});

