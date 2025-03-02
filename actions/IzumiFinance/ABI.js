{
  "izumiSwapABI": [
    {
      "functionName": "constructor",
      "description": "Inicializa el contrato con _factory y _weth.",
      "inputs": [
        { "name": "_factory", "type": "address" },
        { "name": "_weth", "type": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "functionName": "WETH9",
      "description": "Retorna la dirección del contrato WETH9.",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "functionName": "factory",
      "description": "Retorna la dirección de la factory.",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "functionName": "multicall",
      "description": "Ejecuta múltiples llamadas (encapsuladas) en una sola transacción.",
      "inputs": [
        { "name": "data", "type": "bytes[]" }
      ],
      "outputs": [
        { "name": "results", "type": "bytes[]" }
      ],
      "stateMutability": "payable"
    },
    {
      "functionName": "pool",
      "description": "Retorna la dirección del pool para tokenX, tokenY y fee.",
      "inputs": [
        { "name": "tokenX", "type": "address" },
        { "name": "tokenY", "type": "address" },
        { "name": "fee", "type": "uint24" }
      ],
      "outputs": [
        { "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "functionName": "refundETH",
      "description": "Reembolsa ETH no utilizado en la transacción.",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "functionName": "swapAmount",
      "description": "Realiza un swap especificando la cantidad exacta a intercambiar y la mínima cantidad a recibir.",
      "inputs": [
        {
          "name": "params",
          "type": "tuple",
          "components": [
            { "name": "path", "type": "bytes" },
            { "name": "recipient", "type": "address" },
            { "name": "amount", "type": "uint128" },
            { "name": "minAcquired", "type": "uint256" },
            { "name": "deadline", "type": "uint256" }
          ]
        }
      ],
      "outputs": [
        { "name": "cost", "type": "uint256" },
        { "name": "acquire", "type": "uint256" }
      ],
      "stateMutability": "payable"
    },
    {
      "functionName": "swapDesire",
      "description": "Realiza un swap basado en la cantidad deseada a recibir.",
      "inputs": [
        {
          "name": "params",
          "type": "tuple",
          "components": [
            { "name": "path", "type": "bytes" },
            { "name": "recipient", "type": "address" },
            { "name": "desire", "type": "uint128" },
            { "name": "maxPayed", "type": "uint256" },
            { "name": "deadline", "type": "uint256" }
          ]
        }
      ],
      "outputs": [
        { "name": "cost", "type": "uint256" },
        { "name": "acquire", "type": "uint256" }
      ],
      "stateMutability": "payable"
    },
    {
      "functionName": "swapX2YCallback",
      "description": "Callback para la función de swap de token X a token Y.",
      "inputs": [
        { "name": "x", "type": "uint256" },
        { "name": "y", "type": "uint256" },
        { "name": "data", "type": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "functionName": "swapY2XCallback",
      "description": "Callback para la función de swap de token Y a token X.",
      "inputs": [
        { "name": "x", "type": "uint256" },
        { "name": "y", "type": "uint256" },
        { "name": "data", "type": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "functionName": "sweepToken",
      "description": "Transfiere cualquier saldo remanente de un token.",
      "inputs": [
        { "name": "token", "type": "address" },
        { "name": "minAmount", "type": "uint256" },
        { "name": "recipient", "type": "address" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "functionName": "unwrapWETH9",
      "description": "Convierte WETH9 en ETH nativo.",
      "inputs": [
        { "name": "minAmount", "type": "uint256" },
        { "name": "recipient", "type": "address" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  "izumiQuoterABI": [
    {
      "functionName": "constructor",
      "description": "Inicializa el contrato Quoter con _factory y _weth.",
      "inputs": [
        { "name": "_factory", "type": "address" },
        { "name": "_weth", "type": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "functionName": "WETH9",
      "description": "Retorna la dirección de WETH9.",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "functionName": "factory",
      "description": "Retorna la dirección de la factory asociada.",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "functionName": "multicall",
      "description": "Ejecuta múltiples llamadas de funciones en una sola transacción.",
      "inputs": [
        { "name": "data", "type": "bytes[]" }
      ],
      "outputs": [
        { "name": "results", "type": "bytes[]" }
      ],
      "stateMutability": "payable"
    },
    {
      "functionName": "swapDesire",
      "description": "Simula un swap para cotizar la cantidad a pagar en función del deseo.",
      "inputs": [
        { "name": "desire", "type": "uint128" },
        { "name": "path", "type": "bytes" }
      ],
      "outputs": [
        { "name": "cost", "type": "uint256" },
        { "name": "pointAfterList", "type": "int24[]" }
      ],
      "stateMutability": "nonpayable"
    }
  ]
}
