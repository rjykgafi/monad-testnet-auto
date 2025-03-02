const fs = require('fs');
const ethers = require('ethers');
const inquirer = require('inquirer');
const path = require('path');

const walletsFilePath = path.resolve(__dirname, 'wallets.json');

const loadWallets = () => {
    if (!fs.existsSync(walletsFilePath)) {
        fs.writeFileSync(walletsFilePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(walletsFilePath, 'utf-8');
    return JSON.parse(data);
};

const saveWallets = (wallets) => {
    fs.writeFileSync(walletsFilePath, JSON.stringify(wallets, null, 2));
};

const generateWallets = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'number',
            name: 'count',
            message: 'How many wallets do you want to generate?',
            validate: value => value > 0 ? true : 'Enter a positive number'
        }
    ]);

    const count = answers.count;
    const wallets = loadWallets();
    const startId = wallets.length + 1;

    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        const id = startId + i;
        wallets.push({
            id: id,
            address: wallet.address,
            privateKey: wallet.privateKey
        });
    }

    saveWallets(wallets);
    console.log(`${count} wallets have been generated and saved to wallets.json`);
};

generateWallets();
