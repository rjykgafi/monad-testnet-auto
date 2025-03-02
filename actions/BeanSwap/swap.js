const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");
const { 
  ROUTER_CONTRACT, 
  WMON_CONTRACT, 
  USDC_CONTRACT, 
  BEAN_CONTRACT, 
  JAI_CONTRACT, 
  ABI 
} = require("./ABI");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");

const availableTokens = {
  MON: { name: "MON", address: null, decimals: 18, native: true },
  WMON: { name: "WMON", address: WMON_CONTRACT, decimals: 18, native: false },
  USDC: { name: "USDC", address: USDC_CONTRACT, decimals: 6, native: false },
  BEAN: { name: "BEAN", address: BEAN_CONTRACT, decimals: 18, native: false },
  JAI: { name: "JAI", address: JAI_CONTRACT, decimals: 18, native: false },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTokenBalance(provider, walletAddress, token) {
  if (token.native) {
    const balance = await provider.getBalance(walletAddress);
    return ethers.utils.formatUnits(balance, token.decimals);
  } else {
    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
    ];
    const tokenContract = new ethers.Contract(token.address, erc20ABI, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return ethers.utils.formatUnits(balance, token.decimals);
  }
}

async function approveTokenIfNeeded(wallet, token, amount, routerAddress) {
  if (token.native) return;
  const erc20ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  const tokenContract = new ethers.Contract(token.address, erc20ABI, wallet);
  const allowance = await tokenContract.allowance(wallet.address, routerAddress);
  if (allowance.lt(amount)) {
    console.log(chalk.cyan(`⚙️  Approving - [${token.name}]`));
    await tokenContract.approve(routerAddress, ethers.constants.MaxUint256);
    await sleep(1000);
    console.log(chalk.cyan(`✅ [${token.name}] Approved to be Used for Swap`));
  }
}

async function performSwap(wallet, tokenA, tokenB, swapAmountInput, provider) {
  // If converting native MON to WMON, use deposit; if vice versa, use withdraw.
  if (tokenA.native && tokenB.name === "WMON") {
    const amountIn = ethers.utils.parseEther(swapAmountInput);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function deposit() payable"], wallet);
    console.log(chalk.cyan(`🔄 Converting MON to WMON via deposit...`));
    const tx = await wmonContract.deposit({ value: amountIn });
    console.log(chalk.cyan(`🚀 Deposit Tx Sent! ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.cyan(`✅ Deposit Confirmed in Block - ${receipt.blockNumber}`));
    return;
  }
  if (tokenA.name === "WMON" && tokenB.native) {
    const amountIn = ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function withdraw(uint256)"], wallet);
    console.log(chalk.cyan(`🔄 Converting WMON to MON via withdraw...`));
    const tx = await wmonContract.withdraw(amountIn);
    console.log(chalk.cyan(`🚀 Withdraw Tx Sent! ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.cyan(`✅ Withdraw Confirmed in Block - ${receipt.blockNumber}`));
    return;
  }

  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, wallet);
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 6 * 3600;

  let path = [];
  if (tokenA.native) {
    path.push(WMON_CONTRACT);
  } else {
    path.push(tokenA.address);
  }
  if (tokenB.native) {
    path.push(WMON_CONTRACT);
  } else {
    path.push(tokenB.address);
  }

  const amountIn = tokenA.native
    ? ethers.utils.parseEther(swapAmountInput)
    : ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);

  const amountsOut = await routerContract.getAmountsOut(amountIn, path);
  const expectedOut = amountsOut[amountsOut.length - 1];
  const humanReadableOut = tokenB.native
    ? ethers.utils.formatEther(expectedOut)
    : ethers.utils.formatUnits(expectedOut, tokenB.decimals);

  console.log(chalk.cyan(`🔮 Expected Amount to Receive: [${humanReadableOut} ${tokenB.name}]`));

  // Check approval for both tokens (if non-native)
  if (!tokenA.native) {
    await approveTokenIfNeeded(wallet, tokenA, amountIn, ROUTER_CONTRACT);
  }
  if (!tokenB.native) {
    await approveTokenIfNeeded(wallet, tokenB, expectedOut, ROUTER_CONTRACT);
  }

  const feeData = await provider.getFeeData();
  const randomGasLimit = Math.floor(Math.random() * (350000 - 250000 + 1)) + 350000;
  const maxFeePerGas = feeData.lastBaseFeePerGas.mul(110).div(100);
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.mul(110).div(100);
  const txOverrides = {
    gasLimit: randomGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  let tx;
  if (tokenA.native) {
    tx = await routerContract.swapExactETHForTokens(
      expectedOut,
      path,
      wallet.address,
      deadline,
      { value: amountIn, ...txOverrides }
    );
  } else if (tokenB.native) {
    tx = await routerContract.swapExactTokensForETH(
      amountIn,
      expectedOut,
      path,
      wallet.address,
      deadline,
      txOverrides
    );
  } else {
    tx = await routerContract.swapExactTokensForTokens(
      amountIn,
      expectedOut,
      path,
      wallet.address,
      deadline,
      txOverrides
    );
  }

  console.log(chalk.cyan(`🔄 Swapping - [${tokenA.name}/${tokenB.name}]`));
  console.log(chalk.cyan(`🚀 Swap Tx Sent! ${TX_EXPLORER}${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.cyan(`✅ Tx Confirmed in Block - ${receipt.blockNumber}`));
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  let useSameWallet = false;
  let currentWallet;
  do {
    if (!useSameWallet || !currentWallet) {
      const { walletId } = await inquirer.prompt([
        {
          type: "input",
          name: "walletId",
          message: "Please insert the ID for Wallet to perform Swap:",
          validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a valid wallet ID"
        }
      ]);
      const walletInfo = wallets.find(w => w.id === Number(walletId));
      if (!walletInfo) {
        console.log(chalk.magenta("Wallet not found. Try again."));
        continue;
      }
      currentWallet = new ethers.Wallet(walletInfo.privateKey, provider);
    }

    const assetChoices = [
      { name: "MON", value: "MON" },
      { name: "WMON", value: "WMON" },
      { name: "USDC", value: "USDC" },
      { name: "BEAN", value: "BEAN" },
      { name: "JAI", value: "JAI" },
      { name: "Other", value: "OTHER" }
    ];
    const { tokenAChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenAChoice",
        message: "Select the asset you want to swap (source):",
        choices: assetChoices
      }
    ]);
    let tokenA = tokenAChoice !== "OTHER" ? availableTokens[tokenAChoice] : null;
    if (tokenAChoice === "OTHER") {
      const otherToken = await inquirer.prompt([
        { type: "input", name: "symbol", message: "Enter token symbol:" },
        { type: "input", name: "address", message: "Enter token contract address:" },
        { type: "input", name: "decimals", message: "Enter token decimals:", validate: input => !isNaN(input) ? true : "Enter a number" }
      ]);
      tokenA = {
        name: otherToken.symbol,
        address: otherToken.address,
        decimals: Number(otherToken.decimals),
        native: false
      };
    }

    const { tokenBChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenBChoice",
        message: "Select the asset you want to receive (target):",
        choices: assetChoices
      }
    ]);
    let tokenB = tokenBChoice !== "OTHER" ? availableTokens[tokenBChoice] : null;
    if (tokenBChoice === "OTHER") {
      const otherToken = await inquirer.prompt([
        { type: "input", name: "symbol", message: "Enter token symbol:" },
        { type: "input", name: "address", message: "Enter token contract address:" },
        { type: "input", name: "decimals", message: "Enter token decimals:", validate: input => !isNaN(input) ? true : "Enter a number" }
      ]);
      tokenB = {
        name: otherToken.symbol,
        address: otherToken.address,
        decimals: Number(otherToken.decimals),
        native: false
      };
    }

    const balanceA = await getTokenBalance(provider, currentWallet.address, tokenA);
    const balanceB = await getTokenBalance(provider, currentWallet.address, tokenB);
    console.log(chalk.cyan("💰 Current Balances:"));
    console.log(chalk.magenta(`${tokenA.name} - ${balanceA}`));
    console.log(chalk.magenta(`${tokenB.name} - ${balanceB}`));

    const { swapAmount } = await inquirer.prompt([
      {
        type: "input",
        name: "swapAmount",
        message: `How much ${tokenA.name} would you like to swap?`,
        validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a positive number"
      }
    ]);

    await performSwap(currentWallet, tokenA, tokenB, swapAmount, provider);

    const newBalanceA = await getTokenBalance(provider, currentWallet.address, tokenA);
    const newBalanceB = await getTokenBalance(provider, currentWallet.address, tokenB);
    console.log(chalk.cyan("💰 Current Balances After Swap:"));
    console.log(chalk.magenta(`${tokenA.name} - ${newBalanceA}`));
    console.log(chalk.magenta(`${tokenB.name} - ${newBalanceB}`));

    const { doAnother } = await inquirer.prompt([
      { type: "confirm", name: "doAnother", message: "Would you like to perform another swap?", default: false }
    ]);
    if (!doAnother) break;
    const { useSame } = await inquirer.prompt([
      { type: "confirm", name: "useSame", message: "Would you like to use the same wallet?", default: true }
    ]);
    useSameWallet = useSame;
    clear();
  } while (true);
}

main().catch(console.error);
