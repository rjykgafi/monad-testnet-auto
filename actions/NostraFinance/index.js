// actions/NostraFinance/index.js

const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");
const wallets = require("../../utils/wallets.json");
const { RPC_URL, TX_EXPLORER, CHAIN_ID, SYMBOL } = require("../../utils/chain.js");
const ABI = require("./ABI.js");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Nueva constante para el contrato CDP_MANAGER
const CDP_MANAGER = "0x610fd1c98b2a3edca353e39bee378a1256157f62";

const STANDARD_ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
];

const STANDARD_PROTOCOL_ABI = ABI.STANDARD_PROTOCOL_ABI;

const assets = {
  WMON: {
    tokenAddress: ABI.WMON_CONTRACT,
    symbol: "WMON",
    lendingManagerAddress: ABI.WMON_LENDING_MANAGER_ADDRESS,
    lendingManagerABI: ABI.WMON_LENDING_MANAGER_ABI,
    borrowerAddress: ABI.WMON_BORROWER_ADDRESS,
    borrowerABI: ABI.WMON_BORROWER_ABI
  },
  USDC: {
    tokenAddress: ABI.USDC_CONTRACT,
    symbol: "USDC",
    lendingManagerAddress: ABI.USDC_LENDING_MANAGER_ADDRESS,
    lendingManagerABI: ABI.USDC_LENDING_MANAGER_ABI,
    borrowerAddress: ABI.USDC_BORROWER_ADDRESS,
    borrowerABI: ABI.USDC_BORROWER_ABI
  },
  USDT: {
    tokenAddress: ABI.USDT_CONTRACT,
    symbol: "USDT",
    lendingManagerAddress: ABI.USDT_LENDING_MANAGER_ADDRESS,
    lendingManagerABI: ABI.USDT_LENDING_MANAGER_ABI,
    borrowerAddress: ABI.USDT_BORROWER_ADDRESS,
    borrowerABI: ABI.USDT_BORROWER_ABI
  }
};

async function selectWallets() {
  const { walletScope } = await inquirer.prompt([
    {
      type: "list",
      name: "walletScope",
      message: "On which wallets would you like to operate?",
      choices: [
        { name: "All of them", value: "all" },
        { name: "Specific ID", value: "specific" }
      ]
    }
  ]);
  if (walletScope === "all") return wallets;
  const { walletId } = await inquirer.prompt([
    {
      type: "input",
      name: "walletId",
      message: "Please insert the ID of the wallet to be used:",
      validate: (value) => {
        const num = parseInt(value);
        return num > 0 && num <= wallets.length
          ? true
          : `Enter a valid wallet ID (1 - ${wallets.length})`;
      }
    }
  ]);
  return wallets.filter(w => w.id === parseInt(walletId));
}

async function selectAsset() {
  const { asset } = await inquirer.prompt([
    {
      type: "list",
      name: "asset",
      message: "Select an asset:",
      choices: [
        { name: "WMON", value: "WMON" },
        { name: "USDC", value: "USDC" },
        { name: "USDT", value: "USDT" }
      ]
    }
  ]);
  return assets[asset];
}

async function depositAssets(selectedWallets, assetInfo) {
  const tokenContract = new ethers.Contract(assetInfo.tokenAddress, STANDARD_ERC20_ABI, provider);
  const lmContract = new ethers.Contract(assetInfo.lendingManagerAddress, assetInfo.lendingManagerABI, provider);
  for (const w of selectedWallets) {
    const walletSigner = new ethers.Wallet(w.privateKey, provider);
    const tokenWithSigner = tokenContract.connect(walletSigner);
    const lmWithSigner = lmContract.connect(walletSigner);
    const balance = await tokenWithSigner.balanceOf(w.address);
    const balanceEth = parseFloat(ethers.utils.formatEther(balance));
    console.log(chalk.green(`Wallet Selected is - [${w.address}]`));
    console.log(chalk.green(`[${assetInfo.symbol}]: ${balanceEth.toFixed(6)}`));
    const { depositAmount } = await inquirer.prompt([
      {
        type: "input",
        name: "depositAmount",
        message: "Enter the amount to deposit:",
        validate: (value) => {
          const num = parseFloat(value);
          return num > 0 && num <= balanceEth ? true : `Enter a number between 0 and ${balanceEth.toFixed(6)}`;
        }
      }
    ]);
    const amountWei = ethers.utils.parseEther(depositAmount);
    const currentAllowance = await tokenWithSigner.allowance(w.address, assetInfo.lendingManagerAddress);
    if (currentAllowance.lt(amountWei)) {
      console.log(chalk.green(`Approving [${assetInfo.symbol}] to be used`));
      const approveTx = await tokenWithSigner.approve(assetInfo.lendingManagerAddress, ethers.constants.MaxUint256);
      await approveTx.wait();
      console.log(chalk.green(`[${assetInfo.symbol}] is now approved to be used`));
    }
    const tx = await lmWithSigner.deposit(w.address, amountWei);
    console.log(chalk.magenta(`Deposit Tx sent! [${TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(chalk.green(`Confirmed in block - [${receipt.blockNumber}]`));
    } else {
      console.log(chalk.red("Transaction reverted."));
    }
  }
}

async function withdrawAssets(selectedWallets, assetInfo) {
  // Se usa CDP_MANAGER para consultar posiciones
  const protocolContract = new ethers.Contract(CDP_MANAGER, STANDARD_PROTOCOL_ABI, provider);
  const lmContract = new ethers.Contract(assetInfo.lendingManagerAddress, assetInfo.lendingManagerABI, provider);
  for (const w of selectedWallets) {
    const walletSigner = new ethers.Wallet(w.privateKey, provider);
    const lmWithSigner = lmContract.connect(walletSigner);
    const accountData = await protocolContract.getUserAccountData(w.address);
    const collateral = accountData.adjustedTotalCollateral;
    console.log(chalk.green(`Wallet Selected is - [${w.address}]`));
    console.log(chalk.green(`[${assetInfo.symbol}] Collateral: ${parseFloat(ethers.utils.formatEther(collateral)).toFixed(6)}`));
    const tx = await lmWithSigner.withdraw(w.address, w.address, collateral);
    console.log(chalk.magenta(`Withdraw Tx sent! [${TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(chalk.green(`Confirmed in block - [${receipt.blockNumber}]`));
    } else {
      console.log(chalk.red("Transaction reverted."));
    }
  }
}

async function borrowAssets(selectedWallets, assetInfo) {
  const borrowerContract = new ethers.Contract(assetInfo.borrowerAddress, assetInfo.borrowerABI, provider);
  for (const w of selectedWallets) {
    const walletSigner = new ethers.Wallet(w.privateKey, provider);
    const borrowerWithSigner = borrowerContract.connect(walletSigner);
    console.log(chalk.green(`Wallet Selected is - [${w.address}]`));
    const { borrowAmount } = await inquirer.prompt([
      {
        type: "input",
        name: "borrowAmount",
        message: "Enter the amount to borrow:",
        validate: (value) => parseFloat(value) > 0 ? true : "Amount must be > 0"
      }
    ]);
    const amountWei = ethers.utils.parseEther(borrowAmount);
    const tx = await borrowerWithSigner.borrow(w.address, amountWei);
    console.log(chalk.magenta(`Borrow Tx sent! [${TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(chalk.green(`Confirmed in block - [${receipt.blockNumber}]`));
    } else {
      console.log(chalk.red("Transaction reverted."));
    }
  }
}

async function repayAssets(selectedWallets, assetInfo) {
  const borrowerContract = new ethers.Contract(assetInfo.borrowerAddress, assetInfo.borrowerABI, provider);
  // Se usa CDP_MANAGER para consultar la deuda actual
  const protocolContract = new ethers.Contract(CDP_MANAGER, STANDARD_PROTOCOL_ABI, provider);
  for (const w of selectedWallets) {
    const walletSigner = new ethers.Wallet(w.privateKey, provider);
    const borrowerWithSigner = borrowerContract.connect(walletSigner);
    const accountData = await protocolContract.getUserAccountData(w.address);
    const debt = accountData.adjustedTotalDebt;
    console.log(chalk.green(`Wallet Selected is - [${w.address}]`));
    console.log(chalk.green(`[${assetInfo.symbol}] Debt: ${parseFloat(ethers.utils.formatEther(debt)).toFixed(6)}`));
    const { repayAmount } = await inquirer.prompt([
      {
        type: "input",
        name: "repayAmount",
        message: "Enter the amount to repay:",
        validate: (value) => {
          const num = parseFloat(value);
          const debtEth = parseFloat(ethers.utils.formatEther(debt));
          return num > 0 && num <= debtEth
            ? true
            : `Enter a number between 0 and ${debtEth.toFixed(6)}`;
        }
      }
    ]);
    const amountWei = ethers.utils.parseEther(repayAmount);
    const tx = await borrowerWithSigner.repay(w.address, amountWei);
    console.log(chalk.magenta(`Repay Tx sent! [${TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(chalk.green(`Confirmed in block - [${receipt.blockNumber}]`));
    } else {
      console.log(chalk.red("Transaction reverted."));
    }
  }
}

async function mainMenu() {
  clear();
  console.log(chalk.magenta("🌟 NostraFinance Lending Menu"));
  const { operation } = await inquirer.prompt([
    {
      type: "list",
      name: "operation",
      message: "Select an operation:",
      choices: [
        { name: "Deposit Assets", value: "deposit" },
        { name: "Withdraw Assets", value: "withdraw" },
        { name: "Borrow Assets", value: "borrow" },
        { name: "Repay Assets", value: "repay" }
      ]
    }
  ]);
  const selectedWallets = await selectWallets();
  const assetInfo = await selectAsset();

  switch (operation) {
    case "deposit":
      await depositAssets(selectedWallets, assetInfo);
      break;
    case "withdraw":
      await withdrawAssets(selectedWallets, assetInfo);
      break;
    case "borrow":
      await borrowAssets(selectedWallets, assetInfo);
      break;
    case "repay":
      await repayAssets(selectedWallets, assetInfo);
      break;
    default:
      break;
  }
  await inquirer.prompt([{ type: "input", name: "pause", message: "Press ENTER to return to main menu..." }]);
  mainMenu();
}

mainMenu().catch(err => {
  console.error(chalk.red(err));
});
