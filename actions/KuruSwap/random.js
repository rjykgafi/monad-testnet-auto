/*********************************************************************
 * random.js
 *
 * This script automatically performs a random number (between 5 and 10)
 * of swaps for each wallet defined in wallets.json. It only supports
 * swaps between MON and another TOKEN (excluding WMON), according to:
 *
 * 1. If the wallet only holds MON, a random amount between 0.01 and 0.04 MON
 *    is swapped (MON → TOKEN).
 * 2. For TOKEN → MON swaps, a random percentage (between 10% and 30%) of the
 *    token's total balance (rounded to 2 decimals) is swapped.
 *
 * If an error "Signer had insufficient balance" occurs during any swap,
 * the wallet is omitted.
 *
 * The console output format is adapted to match the BeanSwap random swaps style.
 *********************************************************************/

const { ethers, BigNumber } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");

// Import ABIs and addresses for KuruSwap
const {
  KURU_UTILS_ABIS,
  KURU_UTILS_ADDRESS,
  ROUTER_ABIS,
  MON_ADDRESS,
  ROUTER_ADDRESS
} = require("./ABI");

const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");
const { filterMarketPools } = require("./scripts/apis");

// Define token list excluding WMON and with corrected checksum for YAKI
let tokenList = [
  { symbol: "MON", contract: MON_ADDRESS, native: true },
  { symbol: "CHOG", contract: "0xe0590015a873bf326bd645c3e1266d4db41c4e6b", native: false },
  { symbol: "DAK",  contract: "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714", native: false },
  { symbol: "YAKI", contract: "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50", native: false }
];

// Get token decimals dynamically
async function getTokenDecimals(provider, tokenAddress) {
  const token = new ethers.Contract(tokenAddress, [
    "function decimals() external view returns (uint8)"
  ], provider);
  return await token.decimals();
}

// Get ERC20 token data (name, symbol, decimals)
async function getERC20Data(provider, tokenAddress) {
  const token = new ethers.Contract(tokenAddress, [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
  ], provider);
  const [name, symbol, decimals] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals()
  ]);
  return { name, symbol, decimals };
}

// Approve token if needed
async function approveTokenIfNeeded(wallet, tokenAddress, amount, spender) {
  const token = new ethers.Contract(tokenAddress, [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)"
  ], wallet);
  const allowance = await token.allowance(wallet.address, spender);
  if (allowance.lt(amount)) {
    const tokenData = await getERC20Data(wallet.provider, tokenAddress);
    console.log(chalk.cyan(`⚙️  Approving [${tokenData.symbol}] for router usage...`));
    const tx = await token.approve(spender, ethers.constants.MaxUint256);
    await tx.wait();
    console.log(chalk.cyan(`✅ [${tokenData.symbol}] Approved`));
  }
}

// Get token balance in human-readable format
async function getTokenBalance(provider, wallet, token) {
  if (token.native) {
    return ethers.utils.formatEther(await provider.getBalance(wallet.address));
  } else {
    const contract = new ethers.Contract(token.contract, [
      "function balanceOf(address account) external view returns (uint256)"
    ], provider);
    let decimals = await getTokenDecimals(provider, token.contract);
    return ethers.utils.formatUnits(await contract.balanceOf(wallet.address), decimals);
  }
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executes a swap between sourceToken and targetToken for a given amountIn.
 */
async function executeSwap(provider, wallet, sourceToken, targetToken, amountIn) {
  // 🔍 Query pool for the pair
  console.log(chalk.cyan("🔍 Querying pool for the pair..."));
  const pair = {
    baseToken: sourceToken.contract,
    quoteToken: targetToken.contract
  };

  let poolResponse;
  let poolAddress;
  let routeIsInverted = false;
  try {
    poolResponse = await filterMarketPools([pair]);
  } catch (error) {
    console.error(chalk.red("❌ Error querying pool:"), error);
    return;
  }

  if (poolResponse.data && poolResponse.data.length > 0) {
    poolAddress = poolResponse.data[0].market;
  } else {
    console.log(chalk.yellow(`No pool found for [${sourceToken.symbol}/${targetToken.symbol}]. Trying inverted pair...`));
    const invertedPair = {
      baseToken: targetToken.contract,
      quoteToken: sourceToken.contract
    };
    let poolResponseInverted;
    try {
      poolResponseInverted = await filterMarketPools([invertedPair]);
    } catch (error) {
      console.error(chalk.red("❌ Error querying inverted pool:"), error);
      return;
    }
    if (poolResponseInverted.data && poolResponseInverted.data.length > 0) {
      poolAddress = poolResponseInverted.data[0].market;
      routeIsInverted = true;
      console.log(chalk.green(`Using inverted route for pool [${targetToken.symbol}/${sourceToken.symbol}]`));
    } else {
      console.error(chalk.red(`❌ No route found for pool [${sourceToken.symbol}/${targetToken.symbol}] or its inversion.`));
      return;
    }
  }
  console.log(chalk.green("📌 Pool address:"), poolAddress);

  // Set parameters based on swap direction:
  // For MON ↔ TOKEN swaps:
  // - If source is MON: router: isBuy = [true], nativeSend = [true] (but for calculatePriceOverRoute use isBuy = [false])
  // - If target is MON: router: isBuy = [false], nativeSend = [false] (for calculatePriceOverRoute use isBuy = [true])
  let isBuy, nativeSend, debitToken, creditToken, utilsIsBuy;
  if (sourceToken.symbol === "MON") {
    isBuy = [true];
    nativeSend = [true];
    debitToken = MON_ADDRESS;
    creditToken = targetToken.contract;
    utilsIsBuy = [false];
  } else if (targetToken.symbol === "MON") {
    isBuy = [false];
    nativeSend = [false];
    debitToken = sourceToken.contract;
    creditToken = MON_ADDRESS;
    utilsIsBuy = [true];
  } else {
    console.error(chalk.red("❌ Unsupported swap: only MON ↔ TOKEN swaps are allowed."));
    return;
  }

  // Approve tokens if required
  if (!sourceToken.native && sourceToken.symbol !== "MON") {
    await approveTokenIfNeeded(wallet, sourceToken.contract, amountIn, ROUTER_ADDRESS);
  }
  if (!targetToken.native && targetToken.symbol === "MON") {
    await approveTokenIfNeeded(wallet, targetToken.contract, amountIn, ROUTER_ADDRESS);
  }

  // Call calculatePriceOverRoute to obtain conversion rate
  const kuruUtils = new ethers.Contract(KURU_UTILS_ADDRESS, KURU_UTILS_ABIS, provider);
  let priceForOne;
  try {
    priceForOne = await kuruUtils.calculatePriceOverRoute([poolAddress], utilsIsBuy);
    console.log(chalk.magenta(`🔮 Conversion rate returned (uint256): ${priceForOne.toString()}`));
  } catch (error) {
    console.error(chalk.red("❌ Error calling calculatePriceOverRoute:"), error);
    return;
  }

  const ONE = ethers.constants.WeiPerEther;
  // Calculate expected output (raw units)
  let expectedOut = amountIn.mul(priceForOne).div(ONE);
  // Apply 1% slippage
  const slippageFactor = BigNumber.from("85");
  const slippageDivisor = BigNumber.from("100");
  const expectedOutWithSlippage = expectedOut.mul(slippageFactor).div(slippageDivisor);

  console.log(chalk.cyan(`🔮 Expected Amount to Receive: [${targetToken.symbol} ${expectedOutWithSlippage.toString()} wei]`));

  // Set random gas limit and fee parameters
  const randomGasLimit = Math.floor(Math.random() * (1000000 - 250000 + 1)) + 100000;
  const block = await provider.getBlock("latest");
  const baseFee = block.baseFeePerGas;
  const feeMultiplier = 1.15;
  const maxFeePerGas = baseFee.mul(Math.floor(feeMultiplier * 100)).div(100);
  const maxPriorityFeePerGas = maxFeePerGas;

  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABIS, wallet);
  
  // Convert amountIn to human-readable format instead of wei
  let formattedAmountIn;
  if (sourceToken.native) {
    formattedAmountIn = ethers.utils.formatEther(amountIn);
  } else {
    const decimals = await getTokenDecimals(provider, sourceToken.contract);
    formattedAmountIn = ethers.utils.formatUnits(amountIn, decimals);
  }
  console.log(chalk.cyan(`🔄 Executing swap: ${sourceToken.symbol} → ${targetToken.symbol}`));
  console.log(chalk.cyan(`💰 Amount In: ${formattedAmountIn} ${sourceToken.symbol}`));

  const txOverrides = {
    gasLimit: randomGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    value: sourceToken.native ? amountIn : 0
  };

  try {
    const tx = await router.anyToAnySwap(
      [poolAddress],
      isBuy,
      nativeSend,
      debitToken,
      creditToken,
      amountIn,
      expectedOutWithSlippage,
      txOverrides
    );
    console.log(chalk.cyan(`🚀 Swap Tx sent! ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.cyan(`✅ Tx confirmed in block ${receipt.blockNumber}`));
  } catch (error) {
    // Propagate error if it's due to insufficient balance
    if (error.message && error.message.includes("insufficient balance")) {
      throw error;
    }
    if (error.code === "CALL_EXCEPTION") {
      console.error(chalk.red("❌ Swap transaction failed: CALL_EXCEPTION. Check your parameters and try again."));
    } else {
      console.error(chalk.red("❌ Swap transaction error:"), error);
    }
    return;
  }

  // Display updated balances
  const sourceBalanceAfter = await getTokenBalance(provider, wallet, sourceToken);
  const targetBalanceAfter = await getTokenBalance(provider, wallet, targetToken);
  console.log(chalk.gray(`After Swap - [${sourceToken.symbol}]: ${sourceBalanceAfter}`));
  console.log(chalk.gray(`After Swap - [${targetToken.symbol}]: ${targetBalanceAfter}`));
}

/**
 * Performs between 5 and 10 random swaps for a given wallet.
 */
async function performRandomSwaps(provider, wallet) {
  console.log(chalk.yellow(`\nWallet [${wallet.address}]`));

  // Get MON balance
  const monToken = tokenList.find(t => t.symbol === "MON");
  let monBalance = parseFloat(await getTokenBalance(provider, wallet, monToken));

  // Get balances for other tokens (excluding MON)
  let tokenBalances = {};
  for (let token of tokenList) {
    if (token.symbol === "MON") continue;
    const balanceStr = await getTokenBalance(provider, wallet, token);
    tokenBalances[token.symbol] = parseFloat(balanceStr);
  }

  // Determine if wallet holds only MON
  let onlyMon = true;
  for (let sym in tokenBalances) {
    if (tokenBalances[sym] > 0) {
      onlyMon = false;
      break;
    }
  }

  // Random number of swaps between 5 and 10
  const numSwaps = Math.floor(Math.random() * 6) + 5;
  console.log(chalk.cyan(`👉 Performing ${numSwaps} random swaps...`));

  for (let i = 0; i < numSwaps; i++) {
    console.log(chalk.magenta(`\n[Swap #${i + 1}]`));
    let swapDirection;
    if (onlyMon) {
      swapDirection = "MON_TO_TOKEN";
    } else {
      if (monBalance <= 0) {
        swapDirection = "TOKEN_TO_MON";
      } else {
        swapDirection = Math.random() < 0.5 ? "MON_TO_TOKEN" : "TOKEN_TO_MON";
      }
    }

    if (swapDirection === "MON_TO_TOKEN") {
      // Swap a random amount between 0.01 and 0.04 MON, rounded to 2 decimals
      let amount = Math.random() * (0.04 - 0.01) + 0.01;
      amount = parseFloat(amount.toFixed(2));
      if (amount > monBalance) amount = monBalance;
      // Randomly select a target token (excluding MON)
      const availableTokens = tokenList.filter(t => t.symbol !== "MON");
      const targetToken = availableTokens[Math.floor(Math.random() * availableTokens.length)];
      console.log(chalk.cyan(`🔄 Swap: MON → ${targetToken.symbol} | Amount: ${amount} MON`));

      const amountIn = ethers.utils.parseEther(amount.toString());
      // Display balances before swap
      const balanceBefore_MON = await getTokenBalance(provider, wallet, monToken);
      const balanceBefore_TARGET = await getTokenBalance(provider, wallet, targetToken);
      console.log(chalk.gray(`Before Swap - [MON]: ${balanceBefore_MON}`));
      console.log(chalk.gray(`Before Swap - [${targetToken.symbol}]: ${balanceBefore_TARGET}`));

      await executeSwap(provider, wallet, monToken, targetToken, amountIn);
    } else if (swapDirection === "TOKEN_TO_MON") {
      // Select randomly a token (excluding MON) with balance > 0
      const tokensWithBalance = tokenList.filter(t => t.symbol !== "MON" && tokenBalances[t.symbol] > 0);
      if (tokensWithBalance.length === 0) {
        console.log(chalk.yellow("\n⚠️  No token balance available for TOKEN → MON swap. Skipping this swap."));
        continue;
      }
      const selectedToken = tokensWithBalance[Math.floor(Math.random() * tokensWithBalance.length)];
      const tokenBalance = tokenBalances[selectedToken.symbol];
      // Random percentage between 10 and 30%
      let percentage = Math.random() * (30 - 10) + 10;
      percentage = parseFloat(percentage.toFixed(2));
      let amount = tokenBalance * (percentage / 100);
      // Round to 2 decimals
      amount = parseFloat(amount.toFixed(2));
      if (amount <= 0) {
        console.log(chalk.yellow("⚠️  Calculated amount is 0, skipping this swap."));
        continue;
      }
      console.log(chalk.cyan(`🔄 Swap: ${selectedToken.symbol} → MON | Amount: ${amount} ${selectedToken.symbol} (${percentage}% of balance)`));

      // Display balances before swap
      const balanceBefore_TOKEN = await getTokenBalance(provider, wallet, selectedToken);
      const balanceBefore_MON = await getTokenBalance(provider, wallet, monToken);
      console.log(chalk.gray(`Before Swap - [${selectedToken.symbol}]: ${balanceBefore_TOKEN}`));
      console.log(chalk.gray(`Before Swap - [MON]: ${balanceBefore_MON}`));

      // Force amount to 18 decimals for TOKEN → MON swap
      const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
      await executeSwap(provider, wallet, selectedToken, monToken, amountIn);
    }
    // Wait 3 seconds between swaps
    await sleep(3000);
    // Update balances
    monBalance = parseFloat(await getTokenBalance(provider, wallet, monToken));
    for (let token of tokenList) {
      if (token.symbol === "MON") continue;
      tokenBalances[token.symbol] = parseFloat(await getTokenBalance(provider, wallet, token));
    }
  }
}

/**
 * Main function: iterates over each wallet and executes random swaps.
 * If a "Signer had insufficient balance" error occurs, the wallet is omitted.
 */
async function main() {
  clear();
  console.log(chalk.green.bold("🤖 KuruSwap Random Swaps 🤖"));
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  for (let walletInfo of wallets) {
    const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
    try {
      await performRandomSwaps(provider, wallet);
    } catch (error) {
      if (error.message && error.message.includes("insufficient balance")) {
        console.error(chalk.red(`Wallet - [${wallet.address}] Doesn't has enoguh funds to pay swap fees. Skipping...`));
        continue;
      } else {
        console.error(chalk.red("❌ Unexpected error:"), error);
      }
    }
  }

  console.log(chalk.green.bold("\n✅ All random swaps completed!"));
}

main().catch(error => {
  console.error(chalk.red("❌ Unexpected error:"), error);
});
