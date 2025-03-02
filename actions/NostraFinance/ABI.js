// actions/NostraFinance/ABI.js

module.exports = {
  WMON_CONTRACT: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
  USDC_CONTRACT: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
  USDT_CONTRACT: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
  CDP_MANAGER: "0x610fd1c98b2a3edca353e39bee378a1256157f62",

  WMON_LENDING_MANAGER_ADDRESS: "0x4130c5F6F9F8A29DC2f421b0c5f02b983F83B2F0",
  WMON_LENDING_MANAGER_ABI: [
    {
      type: "function",
      name: "approve",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "deposit",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "withdraw",
      stateMutability: "nonpayable",
      inputs: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    }
  ],
  WMON_BORROWER_ADDRESS: "0x813f6149eEC58bA0DD29Bcc97a185257838FD321",
  WMON_BORROWER_ABI: [
    {
      type: "function",
      name: "borrow",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "repay",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    }
  ],

  USDC_LENDING_MANAGER_ADDRESS: "0x2904160c12098D248A5838920fBc2cD1849bc438",
  USDC_LENDING_MANAGER_ABI: [
    {
      type: "function",
      name: "approve",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "deposit",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "withdraw",
      stateMutability: "nonpayable",
      inputs: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    }
  ],
  USDC_BORROWER_ADDRESS: "0x50b1534A08764C54233482C359afa7fCd38Dcd7A",
  USDC_BORROWER_ABI: [
    {
      type: "function",
      name: "borrow",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "repay",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    }
  ],

  USDT_LENDING_MANAGER_ADDRESS: "0x81DDFb51480668af035D730D1c81332355414C40",
  USDT_LENDING_MANAGER_ABI: [
    {
      type: "function",
      name: "approve",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "deposit",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "withdraw",
      stateMutability: "nonpayable",
      inputs: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    }
  ],
  USDT_BORROWER_ADDRESS: "0xD14DD0FFd7033E75A9112C572c62D7810252B1B5",
  USDT_BORROWER_ABI: [
    {
      type: "function",
      name: "borrow",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "repay",
      stateMutability: "nonpayable",
      inputs: [
        { name: "wallet", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: []
    }
  ],

  STANDARD_TOKEN_ABI: [
    {
      type: "function",
      name: "approve",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      outputs: [
        { name: "", type: "bool" }
      ]
    },
    {
      type: "function",
      name: "allowance",
      stateMutability: "view",
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
      ],
      outputs: [
        { name: "", type: "uint256" }
      ]
    }
  ],

  STANDARD_PROTOCOL_ABI: [
    {
      type: "function",
      name: "getCollateralData",
      stateMutability: "view",
      inputs: [
        { name: "asset", type: "address", internalType: "contract IERC20Metadata" }
      ],
      outputs: [
        { name: "assetCollateralToken", type: "address", internalType: "contract INostraAssetToken" },
        { name: "interestCollateralToken", type: "address", internalType: "contract INostraInterestToken" },
        { name: "collateralFactor", type: "uint256", internalType: "uint256" },
        { name: "isUpdatingCollateralFactor", type: "bool", internalType: "bool" },
        { name: "priceFeed", type: "address", internalType: "contract IPriceFeed" },
        { name: "collateralSupplyCap", type: "uint256", internalType: "uint256" }
      ]
    },
    {
      type: "function",
      name: "getDebtData",
      stateMutability: "view",
      inputs: [
        { name: "debtToken", type: "address", internalType: "contract ILentDebtToken" }
      ],
      outputs: [
        { name: "assetTier", type: "uint8", internalType: "uint8" },
        { name: "debtFactor", type: "uint256", internalType: "uint256" },
        { name: "isUpdatingDebtFactor", type: "bool", internalType: "bool" },
        { name: "priceFeed", type: "address", internalType: "contract IPriceFeed" }
      ]
    },
    {
      type: "function",
      name: "getUserAccountData",
      stateMutability: "view",
      inputs: [
        { name: "account", type: "address", internalType: "address" }
      ],
      outputs: [
        { name: "adjustedTotalCollateral", type: "uint256", internalType: "uint256" },
        { name: "adjustedTotalDebt", type: "uint256", internalType: "uint256" },
        { name: "isValidDebt", type: "bool", internalType: "bool" },
        { name: "healthFactor", type: "uint256", internalType: "uint256" }
      ]
    }
  ]
};
