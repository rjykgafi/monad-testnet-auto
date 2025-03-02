const { ethers, BigNumber } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");
const {
  ROUTER_CONTRACT,
  WMON_CONTRACT,
  USDC_CONTRACT,
  BEAN_CONTRACT,
  JAI_CONTRACT,
  ABI
} = require("./ABI");

const availableTokens = {
  MON: { name: "MON", address: null, decimals: 18, native: true },
  WMON: { name: "WMON", address: WMON_CONTRACT, decimals: 18, native: false },
  USDC: { name: "USDC", address: USDC_CONTRACT, decimals: 6, native: false },
  BEAN: { name: "BEAN", address: BEAN_CONTRACT, decimals: 18, native: false },
  JAI: { name: "JAI", address: JAI_CONTRACT, decimals: 18, native: false }
};

const tokenKeys = Object.keys(availableTokens);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatAmount(amount) {
  const num = Number(amount);
  return (Math.floor(num * 1000) / 1000).toString();
}

async function getTokenBalance(provider, walletAddress, token) {
  if (token.native) {
    const balance = await provider.getBalance(walletAddress);
    return ethers.utils.formatUnits(balance, token.decimals);
  } else {
    const erc20ABI = ["function balanceOf(address) view returns (uint256)"];
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
    console.log(chalk.cyan(`⚙️  Approving [${token.name}]`));
    await tokenContract.approve(routerAddress, ethers.constants.MaxUint256);
    await sleep(1000);
    console.log(chalk.cyan(`✅ [${token.name}] Approved`));
  }
}

async function performSwap(wallet, tokenA, tokenB, swapAmountInput, provider) {
  if (tokenA.native && tokenB.name === "WMON") {
    const amountIn = ethers.utils.parseEther(swapAmountInput);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function deposit() payable"], wallet);
    console.log(chalk.cyan(`🔄 Converting MON to WMON via deposit...`));
    const tx = await wmonContract.deposit({ value: amountIn });
    console.log(chalk.cyan(`🚀 Deposit Tx Sent! ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.cyan(`✅ Deposit Confirmed in Block ${receipt.blockNumber}`));
    return;
  }
  if (tokenA.name === "WMON" && tokenB.native) {
    const amountIn = ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function withdraw(uint256)"], wallet);
    console.log(chalk.cyan(`🔄 Converting WMON to MON via withdraw...`));
    const tx = await wmonContract.withdraw(amountIn);
    console.log(chalk.cyan(`🚀 Withdraw Tx Sent! ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.cyan(`✅ Withdraw Confirmed in Block ${receipt.blockNumber}`));
    return;
  }
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, wallet);
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  let path = [];
  path.push(tokenA.native ? WMON_CONTRACT : tokenA.address);
  path.push(tokenB.native ? WMON_CONTRACT : tokenB.address);
  const amountIn = tokenA.native
    ? ethers.utils.parseEther(swapAmountInput)
    : ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);
  const amountsOut = await routerContract.getAmountsOut(amountIn, path);
  const expectedOut = amountsOut[amountsOut.length - 1];
  const humanReadableOut = tokenB.native
    ? ethers.utils.formatEther(expectedOut)
    : ethers.utils.formatUnits(expectedOut, tokenB.decimals);
  console.log(chalk.cyan(`🔮 Expected Amount to Receive: [${humanReadableOut} ${tokenB.name}]`));
  if (!tokenA.native) await approveTokenIfNeeded(wallet, tokenA, amountIn, ROUTER_CONTRACT);
  if (!tokenB.native) await approveTokenIfNeeded(wallet, tokenB, expectedOut, ROUTER_CONTRACT);
  const feeData = await provider.getFeeData();
  const randomGasLimit = getRandomInt(250000, 350000);
  const baseFee = feeData.lastBaseFeePerGas || ethers.utils.parseUnits("1", "gwei");
  const maxFeePerGas = baseFee.mul(110).div(100);
  const priorityFee = feeData.maxPriorityFeePerGas || ethers.utils.parseUnits("2", "gwei");
  const maxPriorityFeePerGas = priorityFee.mul(110).div(100);
  const txOverrides = {
    gasLimit: randomGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas
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
  console.log(chalk.cyan(`🔄 Swapping [${tokenA.name}/${tokenB.name}] - ${swapAmountInput} ${tokenA.name}`));
  console.log(chalk.cyan(`🚀 Swap Tx Sent! ${TX_EXPLORER}${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.cyan(`✅ Tx Confirmed in Block ${receipt.blockNumber}`));
}

async function main() {
  clear();
  console.log(chalk.green.bold("🤖 BeanSwap Random Swaps 🤖"));
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  for (const w of wallets) {
    const wallet = new ethers.Wallet(w.privateKey, provider);
    console.log(chalk.yellow(`\nWallet [${wallet.address}]`));
    const swapsToDo = getRandomInt(5, 10);
    console.log(chalk.cyan(`👉 Performing ${swapsToDo} random swaps...`));
    
    let usedTokenB = [];
    
    for (let i = 1; i <= swapsToDo; i++) {
      console.log(chalk.magenta(`\n[Swap #${i}]`));
      let tokensWithBalance = [];
      for (const key of tokenKeys) {
        const token = availableTokens[key];
        const balStr = await getTokenBalance(provider, wallet.address, token);
        const bal = Number(balStr);
        if (bal > 0) tokensWithBalance.push(token);
      }
      
      let tokenA, tokenB;
      const onlyMONWMON =
        tokensWithBalance.length === 2 &&
        tokensWithBalance.some(t => t.name === "MON") &&
        tokensWithBalance.some(t => t.name === "WMON");
      if (onlyMONWMON) {
        tokenA = availableTokens["MON"];
        const candidates = Object.values(availableTokens).filter(
          t => t.name !== "MON" && t.name !== "WMON"
        );
        tokenB = candidates[getRandomInt(0, candidates.length - 1)];
      } else if (tokensWithBalance.length === 0) {
        console.log(chalk.red("No tokens with positive balance available. Skipping."));
        break;
      } else if (tokensWithBalance.length === 1) {
        tokenA = tokensWithBalance[0];
        const possibleB = Object.values(availableTokens).filter(
          t => t.name !== tokenA.name
        );
        tokenB = possibleB[getRandomInt(0, possibleB.length - 1)];
      } else {
        tokenA = tokensWithBalance[getRandomInt(0, tokensWithBalance.length - 1)];
        let tokensForB = tokensWithBalance.filter(
          (t) => t.name !== tokenA.name && !usedTokenB.includes(t.name)
        );
        if (tokensForB.length === 0) {
          tokensForB = Object.values(availableTokens).filter(
            t => t.name !== tokenA.name
          );
        }
        tokenB = tokensForB[getRandomInt(0, tokensForB.length - 1)];
      }
      
      usedTokenB.push(tokenB.name);
      if (usedTokenB.length > 2) usedTokenB.shift();
      
      const balanceAString = await getTokenBalance(provider, wallet.address, tokenA);
      const balanceA = Number(balanceAString);
      let swapAmountFormatted;
      if (tokenA.name === "MON" || tokenA.name === "WMON") {
        const minVal = 0.02, maxVal = 0.1;
        const randomVal = (Math.random() * (maxVal - minVal)) + minVal;
        swapAmountFormatted = randomVal.toFixed(3);
      } else {
        const fraction = getRandomInt(10, 30) / 100;
        const swapAmount = balanceA * fraction;
        swapAmountFormatted = formatAmount(swapAmount);
      }
      
      console.log(chalk.blue(`Swapping [${tokenA.name}] amount: ${swapAmountFormatted} ${tokenA.name}`));
      
      const balanceA_Before = await getTokenBalance(provider, wallet.address, tokenA);
      const balanceB_Before = await getTokenBalance(provider, wallet.address, tokenB);
      console.log(chalk.gray(`Before Swap - [${tokenA.name}]: ${balanceA_Before}`));
      console.log(chalk.gray(`Before Swap - [${tokenB.name}]: ${balanceB_Before}`));
      
      try {
        await performSwap(wallet, tokenA, tokenB, swapAmountFormatted, provider);
      } catch (err) {
        if (err.code === "CALL_EXCEPTION") {
          console.log(chalk.red("CALL_EXCEPTION occurred. Please check your inputs and try again."));
        } else {
          console.log(chalk.red(`Swap failed: ${err.message}`));
        }
        continue;
      }
      
      const balanceA_After = await getTokenBalance(provider, wallet.address, tokenA);
      const balanceB_After = await getTokenBalance(provider, wallet.address, tokenB);
      console.log(chalk.gray(`After Swap - [${tokenA.name}]: ${balanceA_After}`));
      console.log(chalk.gray(`After Swap - [${tokenB.name}]: ${balanceB_After}`));
      
      await sleep(2000);
    }
  }
  console.log(chalk.green.bold("\n✅ All random swaps completed!"));
}

main().catch((error) => {
  console.error(chalk.red("Unexpected error:"), error);
});
