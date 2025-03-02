const axios = require('axios');
const { ethers } = require('ethers');

async function quoteMintData(nftContract, wallet) {
  const randomReferrer = ethers.Wallet.createRandom().address;
  const payload = {
    currencyChainId: 10143,
    items: [{ token: `${nftContract}:0`, quantity: 1 }],
    partial: true,
    referrer: randomReferrer,
    source: "magiceden.io",
    taker: wallet
  };

  const headers = {
    "Content-Type": "application/json",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "x-rkc-version": "2.5.4"
  };

  try {
    const response = await axios.post(
      "https://api-mainnet.magiceden.io/v3/rtp/monad-testnet/execute/mint/v1",
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("❌ AxiosError:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
}

module.exports = { quoteMintData };
