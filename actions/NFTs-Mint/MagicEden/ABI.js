const ABI = [
  {
    "inputs": [{
      "components": [
        { "name": "target", "type": "address" },
        { "name": "allowFailure", "type": "bool" },
        { "name": "callData", "type": "bytes" }
      ],
      "name": "calls",
      "type": "tuple[]"
    }],
    "name": "aggregate3",
    "outputs": [{
      "components": [
        { "name": "success", "type": "bool" },
        { "name": "returnData", "type": "bytes" }
      ],
      "name": "returnData",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "name": "resolve",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "name", "type": "bytes" },
      { "name": "data", "type": "bytes" }
    ],
    "outputs": [
      { "name": "", "type": "bytes" },
      { "name": "address", "type": "address" }
    ]
  },
  {
    "name": "resolve",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "name", "type": "bytes" },
      { "name": "data", "type": "bytes" },
      { "name": "gateways", "type": "string[]" }
    ],
    "outputs": [
      { "name": "", "type": "bytes" },
      { "name": "address", "type": "address" }
    ]
  },
  {
    "name": "reverse",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "reverseName", "type": "bytes" }
    ],
    "outputs": [
      { "name": "resolvedName", "type": "string" },
      { "name": "resolvedAddress", "type": "address" },
      { "name": "reverseResolver", "type": "address" },
      { "name": "resolver", "type": "address" }
    ]
  },
  {
    "name": "reverse",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "reverseName", "type": "bytes" },
      { "name": "gateways", "type": "string[]" }
    ],
    "outputs": [
      { "name": "resolvedName", "type": "string" },
      { "name": "resolvedAddress", "type": "address" },
      { "name": "reverseResolver", "type": "address" },
      { "name": "resolver", "type": "address" }
    ]
  },
  {
    "name": "text",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "name", "type": "bytes32" },
      { "name": "key", "type": "string" }
    ],
    "outputs": [
      { "name": "", "type": "string" }
    ]
  },
  {
    "name": "addr",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "name", "type": "bytes32" }
    ],
    "outputs": [
      { "name": "", "type": "address" }
    ]
  },
  {
    "name": "addr",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "name", "type": "bytes32" },
      { "name": "coinType", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "bytes" }
    ]
  },
  {
    "name": "isValidSignature",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "hash", "type": "bytes32" },
      { "name": "signature", "type": "bytes" }
    ],
    "outputs": [
      { "name": "", "type": "bytes4" }
    ]
  },
  {
    "name": "isValidSig",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_signer", "type": "address" },
      { "name": "_hash", "type": "bytes32" },
      { "name": "_signature", "type": "bytes" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "allowance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "decimals",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "uint8" }
    ]
  },
  {
    "name": "name",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "string" }
    ]
  },
  {
    "name": "symbol",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "string" }
    ]
  },
  {
    "name": "totalSupply",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "transfer",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "transferFrom",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "sender", "type": "address" },
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "allowance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "decimals",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "uint8" }
    ]
  },
  {
    "name": "name",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "bytes32" }
    ]
  },
  {
    "name": "symbol",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "bytes32" }
    ]
  },
  {
    "name": "totalSupply",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "transfer",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "transferFrom",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "sender", "type": "address" },
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "getApproved",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      { "type": "address" }
    ]
  },
  {
    "name": "isApprovedForAll",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "operator", "type": "address" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "name",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "string" }
    ]
  },
  {
    "name": "ownerOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      { "name": "owner", "type": "address" }
    ]
  },
  {
    "name": "safeTransferFrom",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "safeTransferFrom",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "id", "type": "uint256" },
      { "name": "data", "type": "bytes" }
    ],
    "outputs": []
  },
  {
    "name": "setApprovalForAll",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "operator", "type": "address" },
      { "name": "approved", "type": "bool" }
    ],
    "outputs": []
  },
  {
    "name": "symbol",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "string" }
    ]
  },
  {
    "name": "tokenByIndex",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "index", "type": "uint256" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "tokenByIndex",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "index", "type": "uint256" }
    ],
    "outputs": [
      { "name": "tokenId", "type": "uint256" }
    ]
  },
  {
    "name": "tokenURI",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      { "type": "string" }
    ]
  },
  {
    "name": "totalSupply",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "transferFrom",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "sender", "type": "address" },
      { "name": "recipient", "type": "address" },
      { "name": "tokeId", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "allowance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "asset",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "name": "assetTokenAddress", "type": "address" }
    ]
  },
  {
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "convertToAssets",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "shares", "type": "uint256" }
    ],
    "outputs": [
      { "name": "assets", "type": "uint256" }
    ]
  },
  {
    "name": "convertToShares",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "assets", "type": "uint256" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256" }
    ]
  },
  {
    "name": "deposit",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "assets", "type": "uint256" },
      { "name": "receiver", "type": "address" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256" }
    ]
  },
  {
    "name": "maxDeposit",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "caller", "type": "address" }
    ],
    "outputs": [
      { "name": "maxAssets", "type": "uint256" }
    ]
  },
  {
    "name": "maxMint",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "caller", "type": "address" }
    ],
    "outputs": [
      { "name": "maxShares", "type": "uint256" }
    ]
  },
  {
    "name": "maxRedeem",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "outputs": [
      { "name": "maxShares", "type": "uint256" }
    ]
  },
  {
    "name": "maxWithdraw",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "outputs": [
      { "name": "maxAssets", "type": "uint256" }
    ]
  },
  {
    "name": "mint",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "shares", "type": "uint256" },
      { "name": "receiver", "type": "address" }
    ],
    "outputs": [
      { "name": "assets", "type": "uint256" }
    ]
  },
  {
    "name": "previewDeposit",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "assets", "type": "uint256" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256" }
    ]
  },
  {
    "name": "previewMint",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "shares", "type": "uint256" }
    ],
    "outputs": [
      { "name": "assets", "type": "uint256" }
    ]
  },
  {
    "name": "previewRedeem",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "shares", "type": "uint256" }
    ],
    "outputs": [
      { "name": "assets", "type": "uint256" }
    ]
  },
  {
    "name": "previewWithdraw",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "assets", "type": "uint256" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256" }
    ]
  },
  {
    "name": "redeem",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "shares", "type": "uint256" },
      { "name": "receiver", "type": "address" },
      { "name": "owner", "type": "address" }
    ],
    "outputs": [
      { "name": "assets", "type": "uint256" }
    ]
  },
  {
    "name": "totalAssets",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "name": "totalManagedAssets", "type": "uint256" }
    ]
  },
  {
    "name": "totalSupply",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "type": "uint256" }
    ]
  },
  {
    "name": "transfer",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "transferFrom",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "type": "bool" }
    ]
  },
  {
    "name": "withdraw",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "assets", "type": "uint256" },
      { "name": "receiver", "type": "address" },
      { "name": "owner", "type": "address" }
    ],
    "outputs": [
      { "name": "shares", "type": "uint256" }
    ]
  }
];

module.exports = ABI;
