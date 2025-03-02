## Monad Testnet

Welcome to Monad Testnet, this script will help you to be well positioned for future Testnet launch implementing multi
Testnet Apps Interactions, Protocols, Contract Deployment, etc... All possible stuff related to Monad

``` bash

MonadTestnet/
├── actions/
│   ├── deploy_contract/
│   │   ├── index.js                  # Main script to compile and deploy simple contracts on testnet
│   │   ├── contracts.sol             # Solidity contracts (up to 10 simple contracts)
│   │   ├── ABI.js                    # Exports only the ABI for a sample contract
│   │   ├── launch.js                 # Deployment script for tokens; prompts for token parameters
│   │   └── NFTs/
│   │       ├── deploy.js             # Interactive NFT deployment script (prompts for collection name, ticket, and max supply)
│   │       └── nft.sol               # NFT contract implementing basic functions (mint, burn, transfer, etc.)
│   ├── StakeStone/
│   │   ├── index.js                  # StakeStone module main script (to be implemented)
│   │   └── ABI.js                    # ABI definitions for StakeStone contracts (to be implemented)
│   ├── Multipli/
│   │   ├── index.js                  # Multipli module main script (handles token claims and asset staking)
│   │   └── ABI.js                    # ABI definitions for Multipli contracts (to be implemented)
│   ├── Ambient-Finance/
│   │   ├── index.js                  # Main script for Ambient-Finance module (to be implemented)
│   │   └── ABI.js                    # ABI definitions for Ambient-Finance contracts (to be implemented)
│   ├── Apriori/
│   │   ├── index.js                  # Main script for stake_apr.io module (handles staking & APR token operations)
│   │   ├── ABI.js                    # ABI definitions for Apriori contracts (implemented)
│   │   ├── faucet.js                 # Faucet script for Apriori (to be implemented)
│   │   └── scripts/                  # Additional scripts for Apriori (empty for now)
│   ├── NFTs-Mint/                    
│   │   ├── MagicEden/                
│   │   │   ├── ABI.js                # ABI definitions for MagicEden integration (to be implemented)
│   │   │   ├── index.js              # Main script for MagicEden NFT minting
│   │   │   └── scripts/
│   │   │       └── apis.js           # API calls for MagicEden integration
│   │   └── Testnet.Free/             
│   │       ├── ABI.js                # ABI definitions for Testnet.Free minting (to be implemented)
│   │       └── index.js              # Main script for Testnet.Free NFT minting
│   ├── BeanSwap/
│   │   ├── ABI.js                    # Exports ABI definitions for Bean-Exchange & token + router contracts
│   │   ├── swap.js                   # Interactive swap script with token approvals, dynamic gas settings, and support for wrapping/unwrapping MON/WMON as well as custom tokens
│   │   ├── liquidity.js              # To be implemented – Script for managing liquidity operations (e.g., adding/removing liquidity)
│   │   ├── perps.js                  # To be implemented – Script for handling perpetual contracts trading
│   │   └── random.js                 # Random swap script for BeanSwap (automatically performs random swaps using BeanSwap protocols)
│   ├── Kintzu/
│   │   ├── index.js                  # Main script for the Kintzu module (to be implemented)
│   │   └── ABI.js                    # ABI definitions for Kintzu contracts (to be implemented)
│   ├── Synnax/
│   │   ├── index.js                  # Main script for the Synnax module (to be implemented)
│   │   └── ABI.js                    # ABI definitions for Synnax contracts (to be implemented)
│   ├── Uniswap/
│   │   ├── swap.js                   # Interactive swap script for Uniswap operations
│   │   ├── ABI.js                    # Exports ABI definitions for Uniswap contracts
│   │   └── scripts/
│   │       └── apis.js               # API calls for Uniswap-related operations
│   ├── KuruSwap/
│   │   ├── ABI.js                    # Exports ABI definitions for KuruSwap contracts
│   │   ├── swap.js                   # Script to perform token swaps on the KuruSwap platform
│   │   ├── dev.js                    # Script for token launch and initial purchases on KuruSwap
│   │   ├── launch.js                 # Script for token launch only on KuruSwap
│   │   ├── random.js                 # Random swap script for KuruSwap (automatically performs random swaps on the KuruSwap platform)
│   │   └── scripts/
│   │       └── apis.js               # API calls to fetch parameter data for KuruSwap swap operations
│   └── NostraFinance/
│       ├── ABI.js                    # Exports ABI definitions for NostraFinance contracts
│       └── index.js                  # Main script for the NostraFinance module
├── index.js                          # Main entry point with interactive menu and child process execution
├── package.json                      # npm dependency configuration and scripts
├── wallets.txt                       # Paste your wallets here 
├── proxies.txt                       # List of proxies (one per line in socks5://login:pass@ip:port format)
└── .gitignore       

## Instructions

1. git clone https://github.com/rjykgafi/monad-testnet-auto.git
2. cd monad-testnet-auto
3. npm install
4. Add your privatekeys to wallets.txt
5. Use some of the following prompts to interact with this CLI
6. Enjoy farming :)

- npm start - (runs index.js main code)

Good Luck! :)

## Notes

1. Kintzu is added but can't unstake MON if someone knows what's the function corresponding to methodID: "0x30af6b2e" let me know so I can add unstake MON
2. dev.js & launch.js on KuruSwap will be live very shortly
3. NostraFinance currently just has available Deposit assets + Borrow (will be done shortly)
