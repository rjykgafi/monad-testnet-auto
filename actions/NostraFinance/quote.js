// actions/NostraFinance/quote.js

const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const { RPC_URL, SYMBOL } = require("../../utils/chain.js");
const ABI = require("./ABI.js");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// CDP_MANAGER contract holds the protocol data functions
const CDP_MANAGER = "0x610fd1c98b2a3edca353e39bee378a1256157f62";
const STANDARD_PROTOCOL_ABI = ABI.STANDARD_PROTOCOL_ABI;

// Asset configuration: we use the token address for collateral data
// and the debtToken address for debt data.
const assets = {
  WMON: {
    tokenAddress: ABI.WMON_CONTRACT,
    debtToken: ABI.WMON_BORROWER_ADDRESS
  },
  USDC: {
    tokenAddress: ABI.USDC_CONTRACT,
    debtToken: ABI.USDC_BORROWER_ADDRESS
  },
  USDT: {
    tokenAddress: ABI.USDT_CONTRACT,
    debtToken: ABI.USDT_BORROWER_ADDRESS
  }
};

async function main() {
  // Solicitar el activo a consultar
  const { asset } = await inquirer.prompt([
    {
      type: "list",
      name: "asset",
      message: "Select an asset for which you want to get account details:",
      choices: [
        { name: "WMON", value: "WMON" },
        { name: "USDC", value: "USDC" },
        { name: "USDT", value: "USDT" }
      ]
    }
  ]);
  
  const selectedAsset = assets[asset];

  // Solicitar la dirección de la wallet
  const { walletAddress } = await inquirer.prompt([
    {
      type: "input",
      name: "walletAddress",
      message: "Enter the wallet address:",
      validate: (value) => ethers.utils.isAddress(value) ? true : "Invalid address"
    }
  ]);

  // Instanciar el contrato CDP_MANAGER
  const cdpManager = new ethers.Contract(CDP_MANAGER, STANDARD_PROTOCOL_ABI, provider);

  try {
    // Obtener datos generales de la cuenta
    const accountData = await cdpManager.getUserAccountData(walletAddress);
    // Obtener datos de colateral para el activo (usando la dirección del token)
    const collateralData = await cdpManager.getCollateralData(selectedAsset.tokenAddress);
    // Obtener datos de deuda para el activo (usando la dirección del debtToken)
    const debtData = await cdpManager.getDebtData(selectedAsset.debtToken);

    console.log(chalk.green("\n--- User Account Data ---"));
    console.log(chalk.green(`Deposited Collateral: ${ethers.utils.formatEther(accountData.adjustedTotalCollateral)} ${SYMBOL}`));
    console.log(chalk.green(`Total Debt: ${ethers.utils.formatEther(accountData.adjustedTotalDebt)} ${SYMBOL}`));
    console.log(chalk.green(`Health Factor: ${accountData.healthFactor.toString()}`));

    console.log(chalk.green("\n--- Collateral Data ---"));
    console.log(chalk.green(`Asset Collateral Token: ${collateralData.assetCollateralToken}`));
    console.log(chalk.green(`Interest Collateral Token: ${collateralData.interestCollateralToken}`));
    console.log(chalk.green(`Collateral Factor: ${collateralData.collateralFactor.toString()}`));
    console.log(chalk.green(`Is Updating Collateral Factor: ${collateralData.isUpdatingCollateralFactor}`));
    console.log(chalk.green(`Price Feed: ${collateralData.priceFeed}`));
    console.log(chalk.green(`Collateral Supply Cap: ${collateralData.collateralSupplyCap.toString()}`));

    console.log(chalk.green("\n--- Debt Data ---"));
    console.log(chalk.green(`Asset Tier: ${debtData.assetTier}`));
    console.log(chalk.green(`Debt Factor: ${debtData.debtFactor.toString()}`));
    console.log(chalk.green(`Is Updating Debt Factor: ${debtData.isUpdatingDebtFactor}`));
    console.log(chalk.green(`Debt Price Feed: ${debtData.priceFeed}`));
  } catch (error) {
    console.error(chalk.red("Error fetching account data:"), error);
  }
}

main();
