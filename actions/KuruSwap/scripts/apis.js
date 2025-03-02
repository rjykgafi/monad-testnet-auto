// actions/KuruSwap/scripts/apis.js

const axios = require("axios");

async function submitImage(address, imageBase64) {
  const url = `https://api.testnet.kuru.io/api/v2/${address}/user/imgUpload`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
  };

  const payload = {
    imageBytes: imageBase64,
  };

  const response = await axios.post(url, payload, { headers });

  if (response.data && response.data.success && response.data.data) {
    return response.data.data.data;
  } else {
    throw new Error("Invalid response from imgUpload endpoint.");
  }
}

async function getRecentLaunchs(query = "", limit = 100) {
  try {
    const response = await axios.get(
      `https://api.testnet.kuru.io/api/v2/tokens/search?limit=${limit}&q=${query}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching recent launchs: " + error.message);
  }
}

async function filterMarketPools(pairs) {
  try {
    const response = await axios.post(
      "https://api.testnet.kuru.io/api/v1/markets/filtered",
      { pairs },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error filtering market pools: " + error.message);
  }
}

module.exports = {
  submitImage,
  getRecentLaunchs,
  filterMarketPools,
};
