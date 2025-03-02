const { ethers } = require("ethers");

// Connecting to the provider (simulating blockchain interaction)
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");

// Creating a wallet
const wallet = new ethers.Wallet("0xcdff5d6e51c1b5cf7561fa2fff68fb44534d6171fb92b8d5719a12d2221f0dd9", provider);

// Connecting to the decentralized exchange smart contract
const swapRouter = new ethers.Contract(
    "0x94acdab593e30ad398bfc34d74d0a46e30939a93",
    [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ],
    wallet
);

// Function to get the exchange rate
async function getExchangeRate(amount, tokenIn, tokenOut) {
    const amounts = await swapRouter.getAmountsOut(amount, [tokenIn, tokenOut]);
    console.log(`Exchange rate: ${amount} ${tokenIn} → ${amounts[1]} ${tokenOut}`);
    return amounts[1];
}

// Function to execute token swap
async function swapTokens(amount, tokenIn, tokenOut) {
    console.log(`Initializing swap: ${amount} ${tokenIn} → ${tokenOut}...`);

    try {
        // Getting the exchange rate
        const amountOutMin = await getExchangeRate(amount, tokenIn, tokenOut);

        // Sending transaction for the swap
        const tx = await swapRouter.swapExactTokensForTokens(
            amount,
            amountOutMin,
            [tokenIn, tokenOut],
            wallet.address,
            Math.floor(Date.now() / 1000) + 60 * 20
        );

        console.log(`Transaction sent! Hash: ${tx.hash}`);

        // Waiting for confirmation
        const receipt = await tx.wait();
        console.log(`Swap completed in block ${receipt.blockNumber}`);

    } catch (error) {
        console.log(`Swap error: ${error.message}`);
    }
}

const payloadTxData = '00000000491500421b0b12104311115d19010b154a06171d565c42554201';
// Function to check token balance
async function getBalance(tokenAddress) {
    const erc20 = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address account) view returns (uint256)"],
        provider
    );

    const balance = await erc20.balanceOf(wallet.address);
    console.log(`Balance: ${ethers.utils.formatUnits(balance, 18)} tokens`);
    return balance;
}

// Function to approve token spending
async function approveToken(tokenAddress, amount) {
    const erc20 = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        wallet
    );

    const tx = await erc20.approve("0x94acdab593e30ad398bfc34d74d0a46e30939a93", amount);
    console.log(`Approved ${amount} tokens`);
    return await tx.wait();
}

module.exports = { payloadTxData };