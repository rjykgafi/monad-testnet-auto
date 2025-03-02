// actions/stake_apr.io/ABI.js

const APRMON_STAKE_CONTRACT = "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A";
const ABI = [
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      { "name": "assets", "type": "uint256", "internalType": "uint256" },
      { "name": "receiver", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "requestRedeem",
    "inputs": [
      { "name": "shares", "type": "uint256", "internalType": "uint256" },
      { "name": "controller", "type": "address", "internalType": "address" },
      { "name": "owner", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "requestId", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "redeem",
    "inputs": [
      { "name": "requestId", "type": "uint256", "internalType": "uint256" },
      { "name": "receiver", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "previewRedeem",
    "inputs": [
      { "name": "shares", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "assets", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimableRedeemRequest",
    "inputs": [
      { "name": "requestId", "type": "uint256", "internalType": "uint256" },
      { "name": "controller", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  }
];

module.exports = {
  APRMON_STAKE_CONTRACT,
  ABI
};
