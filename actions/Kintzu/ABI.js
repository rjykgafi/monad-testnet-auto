// actions/Kintzu/ABI.js

module.exports = {
  SMON_STAKE_CONTRACT: "0x07AabD925866E8353407E67C1D157836f7Ad923e",
  KINTZU_ABI: [
    {
      name: "stake",
      type: "function",
      stateMutability: "payable",
      inputs: [],  // No parameters
      outputs: []
    },
    {
      name: "balanceOf",
      type: "function",
      stateMutability: "view",
      inputs: [
        {
          name: "account",
          type: "address"
        }
      ],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      name: "symbol",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "string"
        }
      ]
    },
    {
      name: "name",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "string"
        }
      ]
    },
    {
      name: "decreaseStake",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        {
          name: "tokenId",
          type: "uint256"
        },
        {
          name: "stakeAmount",
          type: "uint256"
        }
      ],
      outputs: []
    },
    {
      name: "increaseStake",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        {
          name: "tokenId",
          type: "uint256"
        },
        {
          name: "stakeAmount",
          type: "uint256"
        }
      ],
      outputs: []
    },
    {
      name: "totalStaked",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    }
  ]
};
