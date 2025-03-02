// actions/KuruSwap/ABI.js

module.exports = {
  KURU_UTILS_ABIS: [
    // ABI for KuruUtils contract
    {
      "inputs": [
        { "internalType": "address[]", "name": "route", "type": "address[]" },
        { "internalType": "bool[]", "name": "isBuy", "type": "bool[]" }
      ],
      "name": "calculatePriceOverRoute",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address[]", "name": "tokens", "type": "address[]" },
        { "internalType": "address", "name": "holder", "type": "address" }
      ],
      "name": "getTokensInfo",
      "outputs": [
        {
          "components": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "symbol", "type": "string" },
            { "internalType": "uint256", "name": "balance", "type": "uint256" },
            { "internalType": "uint8", "name": "decimals", "type": "uint8" },
            { "internalType": "uint256", "name": "totalSupply", "type": "uint256" }
          ],
          "internalType": "struct KuruUtils.TokenInfo[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  KURU_MARGING_ACCOUNT_ABIS: [
    // ABI for MarginAccount contract
    {
      "inputs": [
        { "internalType": "address", "name": "_router", "type": "address" },
        { "internalType": "address", "name": "_feeCollector", "type": "address" },
        { "internalType": "address", "name": "_trustedForwarder", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    { "inputs": [], "name": "InsufficientBalance", "type": "error" },
    { "inputs": [], "name": "NativeAssetMismatch", "type": "error" },
    { "inputs": [], "name": "NativeAssetTransferFail", "type": "error" },
    { "inputs": [], "name": "OnlyRouterAllowed", "type": "error" },
    { "inputs": [], "name": "OnlyVerifiedMarketsAllowed", "type": "error" },
    { "inputs": [], "name": "ZeroAddressNotAllowed", "type": "error" },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "Withdrawal",
      "type": "event"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" }
      ],
      "name": "getBalance",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" }
      ],
      "name": "balanceOf",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "bool", "name": "_useMargin", "type": "bool" }
      ],
      "name": "creditUser",
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "debitUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "address", "name": "token", "type": "address" }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  MONAD_DEPLOYER_ABIS: [
    // ABI for MonadDeployer contract
    {
      "inputs": [
        { "internalType": "contract IRouter", "name": "_router", "type": "address" },
        { "internalType": "address", "name": "_marginAccount", "type": "address" },
        { "internalType": "address", "name": "_kuruCollective", "type": "address" },
        { "internalType": "uint96", "name": "_kuruAmmSpread", "type": "uint96" },
        { "internalType": "uint256", "name": "_kuruCollectiveFee", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "expected", "type": "uint256" },
        { "internalType": "uint256", "name": "received", "type": "uint256" }
      ],
      "name": "InsufficientAssets",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "token", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "tokenURI", "type": "string" },
        { "indexed": false, "internalType": "address", "name": "dev", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "supplyToDev", "type": "uint256" },
        { "indexed": false, "internalType": "address", "name": "market", "type": "address" }
      ],
      "name": "PumpingTime",
      "type": "event"
    },
    {
      "inputs": [
        {
          "components": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "symbol", "type": "string" },
            { "internalType": "string", "name": "tokenURI", "type": "string" },
            { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
            { "internalType": "address", "name": "dev", "type": "address" },
            { "internalType": "uint256", "name": "supplyToDev", "type": "uint256" }
          ],
          "internalType": "struct MonadDeployer.TokenParams",
          "name": "tokenParams",
          "type": "tuple"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "nativeTokenAmount", "type": "uint256" },
            { "internalType": "uint96", "name": "sizePrecision", "type": "uint96" },
            { "internalType": "uint32", "name": "pricePrecision", "type": "uint32" },
            { "internalType": "uint32", "name": "tickSize", "type": "uint32" },
            { "internalType": "uint96", "name": "minSize", "type": "uint96" },
            { "internalType": "uint96", "name": "maxSize", "type": "uint96" },
            { "internalType": "uint256", "name": "takerFeeBps", "type": "uint256" },
            { "internalType": "uint256", "name": "makerFeeBps", "type": "uint256" }
          ],
          "internalType": "struct MonadDeployer.MarketParams",
          "name": "marketParams",
          "type": "tuple"
        }
      ],
      "name": "deployTokenAndMarket",
      "outputs": [
        { "internalType": "address", "name": "market", "type": "address" }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "kuruCollectiveFee",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  ORDER_BOOK_ABIS: [
    // ABI for OrderBook contract
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "AlreadyInitialized", "type": "error" },
    { "inputs": [], "name": "InsufficientLiquidity", "type": "error" },
    { "inputs": [], "name": "InvalidInitialization", "type": "error" },
    { "inputs": [], "name": "InvalidSpread", "type": "error" },
    { "inputs": [], "name": "LengthMismatch", "type": "error" },
    { "inputs": [], "name": "MarketFeeError", "type": "error" },
    { "inputs": [], "name": "MarketStateError", "type": "error" },
    { "inputs": [], "name": "NativeAssetInsufficient", "type": "error" },
    { "inputs": [], "name": "NativeAssetNotRequired", "type": "error" },
    { "inputs": [], "name": "NativeAssetTransferFail", "type": "error" },
    { "inputs": [], "name": "NewOwnerIsZeroAddress", "type": "error" },
    { "inputs": [], "name": "NoHandoverRequest", "type": "error" },
    { "inputs": [], "name": "NotInitializing", "type": "error" },
    { "inputs": [], "name": "OnlyOwnerAllowedError", "type": "error" },
    { "inputs": [], "name": "OnlyVaultAllowed", "type": "error" },
    { "inputs": [], "name": "OrderAlreadyFilledOrCancelled", "type": "error" },
    { "inputs": [], "name": "PostOnlyError", "type": "error" },
    { "inputs": [], "name": "PriceError", "type": "error" },
    { "inputs": [], "name": "SizeError", "type": "error" },
    { "inputs": [], "name": "SlippageExceeded", "type": "error" },
    { "inputs": [], "name": "TickSizeError", "type": "error" },
    { "inputs": [], "name": "TooMuchSizeFilled", "type": "error" },
    { "inputs": [], "name": "Unauthorized", "type": "error" },
    { "inputs": [], "name": "UnauthorizedCallContext", "type": "error" },
    { "inputs": [], "name": "UpgradeFailed", "type": "error" },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "uint64", "name": "version", "type": "uint64" }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "uint40", "name": "orderId", "type": "uint40" },
        { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": false, "internalType": "uint96", "name": "size", "type": "uint96" },
        { "indexed": false, "internalType": "uint32", "name": "price", "type": "uint32" },
        { "indexed": false, "internalType": "bool", "name": "isBuy", "type": "bool" }
      ],
      "name": "OrderCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "uint40[]", "name": "orderId", "type": "uint40[]" },
        { "indexed": false, "internalType": "address", "name": "owner", "type": "address" }
      ],
      "name": "OrdersCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "pendingOwner", "type": "address" }
      ],
      "name": "OwnershipHandoverCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "pendingOwner", "type": "address" }
      ],
      "name": "OwnershipHandoverRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "oldOwner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }
      ],
      "name": "Upgraded",
      "type": "event"
    },
    {
      "inputs": [
        { "internalType": "uint32", "name": "_price", "type": "uint32" },
        { "internalType": "uint96", "name": "size", "type": "uint96" },
        { "internalType": "bool", "name": "_postOnly", "type": "bool" }
      ],
      "name": "addBuyOrder",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint32", "name": "_price", "type": "uint32" },
        { "internalType": "uint96", "name": "size", "type": "uint96" },
        { "internalType": "bool", "name": "_postOnly", "type": "bool" }
      ],
      "name": "addSellOrder",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint40[]", "name": "_orderIds", "type": "uint40[]" }
      ],
      "name": "batchCancelOrders",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint32[]", "name": "buyPrices", "type": "uint32[]" },
        { "internalType": "uint96[]", "name": "buySizes", "type": "uint96[]" },
        { "internalType": "uint32[]", "name": "sellPrices", "type": "uint32[]" },
        { "internalType": "uint96[]", "name": "sellSizes", "type": "uint96[]" },
        { "internalType": "uint40[]", "name": "orderIdsToCancel", "type": "uint40[]" },
        { "internalType": "bool", "name": "postOnly", "type": "bool" }
      ],
      "name": "batchUpdate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bestBidAsk",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cancelOwnershipHandover",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "pendingOwner", "type": "address" }
      ],
      "name": "completeOwnershipHandover",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getL2Book",
      "outputs": [
        { "internalType": "bytes", "name": "", "type": "bytes" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMarketParams",
      "outputs": [
        { "internalType": "uint32", "name": "", "type": "uint32" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "uint32", "name": "", "type": "uint32" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVaultParams",
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "uint96", "name": "", "type": "uint96" },
        { "internalType": "uint96", "name": "", "type": "uint96" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_owner", "type": "address" },
        { "internalType": "enum IOrderBook.OrderBookType", "name": "_type", "type": "uint8" },
        { "internalType": "address", "name": "_baseAssetAddress", "type": "address" },
        { "internalType": "uint256", "name": "_baseAssetDecimals", "type": "uint256" },
        { "internalType": "address", "name": "_quoteAssetAddress", "type": "address" },
        { "internalType": "uint256", "name": "_quoteAssetDecimals", "type": "uint256" },
        { "internalType": "address", "name": "_marginAccountAddress", "type": "address" },
        { "internalType": "uint96", "name": "_sizePrecision", "type": "uint96" },
        { "internalType": "uint32", "name": "_pricePrecision", "type": "uint32" },
        { "internalType": "uint32", "name": "_tickSize", "type": "uint32" },
        { "internalType": "uint96", "name": "_minSize", "type": "uint96" },
        { "internalType": "uint96", "name": "_maxSize", "type": "uint96" },
        { "internalType": "uint256", "name": "_takerFeeBps", "type": "uint256" },
        { "internalType": "uint256", "name": "_makerFeeBps", "type": "uint256" },
        { "internalType": "address", "name": "oldImplementation", "type": "address" },
        { "internalType": "bool", "name": "old", "type": "bool" }
      ],
      "name": "computeAddress",
      "outputs": [
        { "internalType": "address", "name": "proxy", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "enum IOrderBook.OrderBookType", "name": "_type", "type": "uint8" },
        { "internalType": "address", "name": "_baseAssetAddress", "type": "address" },
        { "internalType": "address", "name": "_quoteAssetAddress", "type": "address" },
        { "internalType": "uint96", "name": "_sizePrecision", "type": "uint96" },
        { "internalType": "uint32", "name": "_pricePrecision", "type": "uint32" },
        { "internalType": "uint32", "name": "_tickSize", "type": "uint32" },
        { "internalType": "uint96", "name": "_minSize", "type": "uint96" },
        { "internalType": "uint96", "name": "_maxSize", "type": "uint96" },
        { "internalType": "uint256", "name": "_takerFeeBps", "type": "uint256" },
        { "internalType": "uint256", "name": "_makerFeeBps", "type": "uint256" },
        { "internalType": "uint96", "name": "_kuruAmmSpread", "type": "uint96" }
      ],
      "name": "deployProxy",
      "outputs": [
        { "internalType": "address", "name": "proxy", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isTrustedForwarder",
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        { "internalType": "address", "name": "result", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "pendingOwner", "type": "address" }
      ],
      "name": "ownershipHandoverExpiresAt",
      "outputs": [
        { "internalType": "uint256", "name": "result", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proxiableUUID",
      "outputs": [
        { "internalType": "bytes32", "name": "", "type": "bytes32" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestOwnershipHandover",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "newImplementation", "type": "address" }
      ],
      "name": "upgradeImplementation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address[]", "name": "proxies", "type": "address[]" }
      ],
      "name": "upgradeMultipleProxies",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "newImplementation", "type": "address" },
        { "internalType": "bytes", "name": "data", "type": "bytes" }
      ],
      "name": "upgradeToAndCall",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "receive",
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  MON_ADDRESS: "0x0000000000000000000000000000000000000000",
  WMON_ADDRESS: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
  ROUTER_ADDRESS: "0xc816865f172d640d93712C68a7E1F83F3fA63235",
  DEPLOYER_ADDRESS: "0x67a4e43C7Ce69e24d495A39c43489BC7070f009B",
  KURU_UTILS_ADDRESS: "0x9E50D9202bEc0D046a75048Be8d51bBa93386Ade",

  ROUTER_ABIS: [
    {
      "inputs": [
        { "internalType": "address[]", "name": "_marketAddresses", "type": "address[]" },
        { "internalType": "bool[]", "name": "_isBuy", "type": "bool[]" },
        { "internalType": "bool[]", "name": "_nativeSend", "type": "bool[]" },
        { "internalType": "address", "name": "_debitToken", "type": "address" },
        { "internalType": "address", "name": "_creditToken", "type": "address" },
        { "internalType": "uint256", "name": "_amount", "type": "uint256" },
        { "internalType": "uint256", "name": "_minAmountOut", "type": "uint256" }
      ],
      "name": "anyToAnySwap",
      "outputs": [
        { "internalType": "uint256", "name": "_amountOut", "type": "uint256" }
      ],
      "stateMutability": "payable",
      "type": "function"
    }
  ]
};
