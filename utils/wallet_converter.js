const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const walletsTxtPath = path.join(__dirname, '../wallets.txt');
const walletsJsonPath = path.join(__dirname, 'wallets.json');

// Check if the wallets.txt file exists
if (!fs.existsSync(walletsTxtPath)) {
    console.error('File wallets.txt not found!');
    process.exit(1);
}

// Read the contents of wallets.txt
const fileContent = fs.readFileSync(walletsTxtPath, 'utf-8').trim();

// Check if the file is empty
if (!fileContent) {
    console.error('Error: wallets.txt is empty!');
    process.exit(1);
}

// Parse private keys from the file
const privateKeys = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

// Clear wallets.json before adding new data
fs.writeFileSync(walletsJsonPath, JSON.stringify([], null, 2), 'utf-8');

let walletData = [];
const existingAddresses = new Set();

privateKeys.forEach((privateKey, index) => {
    try {
        const wallet = new ethers.Wallet(privateKey);
        if (!existingAddresses.has(wallet.address.toLowerCase())) {
            walletData.push({
                id: index + 1,
                address: wallet.address,
                privateKey: privateKey
            });
            existingAddresses.add(wallet.address.toLowerCase());
        }
    } catch (error) {
        console.error(`Error processing key: ${privateKey}`, error);
    }
});

// Write the updated list of wallets to wallets.json
fs.writeFileSync(walletsJsonPath, JSON.stringify(walletData, null, 2), 'utf-8');