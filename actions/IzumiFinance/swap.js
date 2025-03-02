// MonadTestnet/actions/IzumiFinance/swap.js
const fs = require('fs');
const inquirer = require('inquirer');
const { ethers } = require('ethers');
const colors = require('colors');
const { iZiSwapRouterABI, izumiQuoterABI } = require('./ABI.js');
const { RPC_URL, CHAIN_ID, SYMBOL, TX_EXPLORER, WMON_ADDRESS } = require('../../utils/chain.js');
const walletsData = require('../../utils/wallets.json');
const ROUTER_CONTRACT = "0xf6ffe4f3fdc8bbb7f70ffd48e61f17d1e343ddfd";
const QUOTER_ADDRESS = "0x95c5F14106ab4d1dc0cFC9326225287c18c2d247";
const tokensList = [
  { symbol: SYMBOL, address: 'NATIVE', decimals: 18 },
  { symbol: 'WMON', address: WMON_ADDRESS, decimals: 18 },
  { symbol: 'USDT', address: '0x6a7436775c0d0B70cfF4c5365404ec37c9d9aF4b', decimals: 6 },
  { symbol: 'OTHER', address: 'OTHER', decimals: 18 }
];
async function getTokenInfo(address) {
  const erc20ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const tokenContract = new ethers.Contract(address, erc20ABI, provider);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { symbol, decimals };
}
async function ensureApproval(tokenContract, spender, signer, amount) {
  const allowance = await tokenContract.allowance(await signer.getAddress(), spender);
  if (allowance.lt(amount)) {
    console.log(colors.blue("ℹ️  Approving token..."));
    const tx = await tokenContract.approve(spender, ethers.constants.MaxUint256);
    console.log(colors.blue("ℹ️  Approve Tx sent: " + TX_EXPLORER + tx.hash));
    const receipt = await tx.wait();
    console.log(colors.green("✅  Approve confirmed in block #" + receipt.blockNumber));
  }
}
async function getBalance(token, walletAddress, provider) {
  if (token.address === 'NATIVE') {
    return provider.getBalance(walletAddress);
  } else {
    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    const contract = new ethers.Contract(token.address, erc20ABI, provider);
    return contract.balanceOf(walletAddress);
  }
}
function getRandomGasLimit() {
  const min = 250000, max = 375000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function getQuote(amountIn, path) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const quoter = new ethers.Contract(QUOTER_ADDRESS, izumiQuoterABI, provider);
  const result = await quoter.callStatic.swapDesire(amountIn, path);
  return result[0];
}
async function swapRoutine(signer, tokenA, tokenB, amountIn, slippagePercent) {
  console.log(colors.blue("ℹ️  Swapping - [" + tokenA.symbol + "/" + tokenB.symbol + "]"));
  let usedTokenAAddress = tokenA.address;
  let valueToSend = ethers.BigNumber.from('0');
  if (tokenA.address === 'NATIVE') {
    usedTokenAAddress = WMON_ADDRESS;
    valueToSend = amountIn;
  } else {
    const erc20ABI = [
      "function allowance(address,address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)"
    ];
    const tokenContract = new ethers.Contract(tokenA.address, erc20ABI, signer);
    await ensureApproval(tokenContract, ROUTER_CONTRACT, signer, amountIn);
  }
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  const maxPayed = amountIn;
  let path;
  if (tokenA.address === 'NATIVE') {
    path = ethers.utils.solidityPack(["address", "address"], [WMON_ADDRESS, tokenB.address]);
  } else {
    path = ethers.utils.solidityPack(["address", "address"], [tokenA.address, tokenB.address]);
  }
  const desireQuoted = await getQuote(amountIn, path);
  const iface = new ethers.utils.Interface(iZiSwapRouterABI);
  const dataSwap = iface.encodeFunctionData("swapDesire", [{
    path: path,
    recipient: await signer.getAddress(),
    desire: desireQuoted,
    maxPayed: maxPayed,
    deadline: deadline
  }]);
  const dataRefund = iface.encodeFunctionData("refundETH");
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, iZiSwapRouterABI, signer);
  const gasLimit = getRandomGasLimit();
  const feeData = await signer.provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas.mul(105).div(100);
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.mul(105).div(100);
  try {
    const tx = await routerContract.multicall(
      [dataSwap, dataRefund],
      { value: valueToSend, gasLimit, maxFeePerGas, maxPriorityFeePerGas }
    );
    console.log(colors.blue("ℹ️  Tx Swap Sent! - " + TX_EXPLORER + tx.hash));
    const receipt = await tx.wait();
    console.log(colors.green("✅  Tx Confirmed in block #" + receipt.blockNumber));
    const addr = await signer.getAddress();
    const balA = await getBalance(tokenA, addr, signer.provider);
    const balB = await getBalance(tokenB, addr, signer.provider);
    console.log(colors.magenta("✅  " + tokenA.symbol + " Balance: " + ethers.utils.formatUnits(balA, tokenA.decimals)));
    console.log(colors.magenta("✅  " + tokenB.symbol + " Balance: " + ethers.utils.formatUnits(balB, tokenB.decimals)));
  } catch (err) {
    if (err.message && err.message.includes("CALL_EXCEPTION")) {
      console.error(colors.red("❌ CALL_EXCEPTION: Transaction failed."));
    } else {
      console.error(colors.red("❌ Error in swap script:"), err);
    }
  }
}
async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const { walletChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletChoice',
      message: 'On which wallets would you like to perform swaps?',
      choices: [
        { name: '1. All of them', value: 'all' },
        { name: '2. Specific IDs', value: 'specific' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);
  if (walletChoice === 'exit') { console.log(colors.red("❌ Exiting...")); return; }
  let chosenWallets = [];
  if (walletChoice === 'all') {
    chosenWallets = walletsData;
  } else if (walletChoice === 'specific') {
    const { walletID } = await inquirer.prompt([
      {
        type: 'input',
        name: 'walletID',
        message: 'Enter the wallet ID to use:',
        validate: (val) => (walletsData.find(w => w.id.toString() === val)) ? true : 'Invalid wallet ID'
      }
    ]);
    chosenWallets = walletsData.filter(w => w.id.toString() === walletID);
  }
  for (const w of chosenWallets) {
    const signer = new ethers.Wallet(w.privateKey, provider);
    console.log(colors.blue("ℹ️  Wallet Selected - [" + w.address + "]"));
    let tokenA, tokenB;
    const { fromTokenChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'fromTokenChoice',
        message: 'What token would you like to give (sell)?',
        choices: tokensList.map(t => (t.symbol === 'OTHER') ? { name: 'Other', value: 'other' } : { name: t.symbol, value: t.symbol })
      }
    ]);
    if (fromTokenChoice === 'other') {
      const { tokenAddress } = await inquirer.prompt([
        { type: 'input', name: 'tokenAddress', message: 'Enter the token contract address:' }
      ]);
      const info = await getTokenInfo(tokenAddress);
      tokenA = { symbol: info.symbol, address: tokenAddress, decimals: info.decimals };
    } else {
      tokenA = tokensList.find(t => t.symbol === fromTokenChoice);
    }
    const { toTokenChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'toTokenChoice',
        message: 'What token would you like to get (buy)?',
        choices: tokensList.filter(t => t.symbol !== tokenA.symbol).map(t => (t.symbol === 'OTHER') ? { name: 'Other', value: 'other' } : { name: t.symbol, value: t.symbol })
      }
    ]);
    if (toTokenChoice === 'other') {
      const { tokenAddress } = await inquirer.prompt([
        { type: 'input', name: 'tokenAddress', message: 'Enter the token contract address:' }
      ]);
      const info = await getTokenInfo(tokenAddress);
      tokenB = { symbol: info.symbol, address: tokenAddress, decimals: info.decimals };
    } else {
      tokenB = tokensList.find(t => t.symbol === toTokenChoice);
    }
    const balA = await getBalance(tokenA, w.address, provider);
    const balB = await getBalance(tokenB, w.address, provider);
    console.log(colors.magenta("✅  " + tokenA.symbol + " Balance: " + ethers.utils.formatUnits(balA, tokenA.decimals)));
    console.log(colors.magenta("✅  " + tokenB.symbol + " Balance: " + ethers.utils.formatUnits(balB, tokenB.decimals)));
    const { amountInStr } = await inquirer.prompt([
      {
        type: 'input',
        name: 'amountInStr',
        message: "How many " + tokenA.symbol + " do you want to swap?",
        validate: (val) => (!isNaN(val) && Number(val) > 0) ? true : 'Please enter a positive number.'
      }
    ]);
    const amountIn = ethers.utils.parseUnits(amountInStr, tokenA.decimals);
    const { slippageStr } = await inquirer.prompt([
      {
        type: 'input',
        name: 'slippageStr',
        message: 'Set slippage % (e.g. 1, 2, 3...)',
        default: '1',
        validate: (val) => (!isNaN(val) && Number(val) >= 0) ? true : 'Please enter a valid number.'
      }
    ]);
    const slippagePercent = parseFloat(slippageStr);
    await swapRoutine(signer, tokenA, tokenB, amountIn, slippagePercent);
  }
  const { repeat } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'repeat',
      message: 'Do you want to perform another swap?',
      default: false
    }
  ]);
  if (repeat) {
    const { reuseWallets } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'reuseWallets',
        message: 'Use the same wallet selection again?',
        default: true
      }
    ]);
    if (!reuseWallets) {
      const { walletChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'walletChoice',
          message: 'On which wallets would you like to perform swaps now?',
          choices: [
            { name: '1. All of them', value: 'all' },
            { name: '2. Specific IDs', value: 'specific' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);
      if (walletChoice === 'exit') { return; }
      if (walletChoice === 'all') { main(); }
      else {
        const { walletID } = await inquirer.prompt([
          {
            type: 'input',
            name: 'walletID',
            message: 'Enter the wallet ID to use:',
            validate: (val) => (walletsData.find(w => w.id.toString() === val)) ? true : 'Invalid wallet ID'
          }
        ]);
        main();
      }
    } else {
      main();
    }
  } else {
    console.log(colors.green("✅  Done with all swaps!"));
  }
}
if (require.main === module) {
  main().catch((err) => {
    console.error(colors.red("❌ Error in swap script:"), err);
  });
}
module.exports = { main };
