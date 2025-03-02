const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ethers = require('ethers');

const walletsFile = path.join(__dirname, 'wallets.json');

const loadWallets = () => {
  if (!fs.existsSync(walletsFile)) {
    fs.writeFileSync(walletsFile, JSON.stringify([]));
  }
  const data = fs.readFileSync(walletsFile, 'utf-8');
  return JSON.parse(data);
};

const saveWallets = (wallets) => {
  fs.writeFileSync(walletsFile, JSON.stringify(wallets, null, 2));
};

const addWallet = async () => {
  const wallets = loadWallets();
  const lastWalletId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0;

  const { privateKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'privateKey',
      message: 'Please The PrivateKey of the Wallet you wish to Add:',
    },
  ]);

  // Se remueven espacios en blanco y se asegura que inicie con "0x"
  let formattedPrivateKey = privateKey.trim();
  if (!formattedPrivateKey.startsWith('0x')) {
    formattedPrivateKey = '0x' + formattedPrivateKey;
  }

  try {
    // Crear la wallet usando ethers
    const walletObj = new ethers.Wallet(formattedPrivateKey);
    console.log(`Wallet Found is [${walletObj.address}]`);

    const newWallet = {
      id: lastWalletId + 1,
      address: walletObj.address,
      privateKey: walletObj.privateKey,
    };

    wallets.push(newWallet);
    saveWallets(wallets);
    console.log('Wallet Has been added');
  } catch (error) {
    console.error('The provided private key is not valid. Please try again.');
  }
};

const main = async () => {
  let adding = true;
  while (adding) {
    await addWallet();
    const { continueAdding } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAdding',
        message: 'Do you wish to add other wallet?',
        default: false,
      },
    ]);
    adding = continueAdding;
  }
};

main();
