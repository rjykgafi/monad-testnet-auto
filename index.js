const figlet = require('figlet');
const inquirer = require('inquirer');
const { spawn } = require('child_process');
const colors = require('colors');
const clear = require('console-clear');
const { getQuote } = require('./actions/Uniswap/scripts/apis');
// const { getQuote } = require('./actions/KuruSwap/swap');

// const EventEmitter = require('events');
// EventEmitter.defaultMaxListeners = 20; 

process.on('SIGINT', () => {
  console.log('\nExiting...'.green);
  process.exit(0);
});

async function pause() {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press ENTER to back main menu...',
    },
  ]);
}

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    child.on('close', () => {
      resolve();
    });
  });
}

async function mainMenu() {
  clear();
  const title = figlet.textSync('Monad Testnet', { horizontalLayout: 'full' });
  const titleV = 'Version: 1.2.15'
  console.log(title.green);
  console.log(titleV.green);
  console.log();

  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Select an option:',
      choices: [
        { name: '1. Execute Swaps', value: 'executeSwaps' },
        { name: '2. Manage Liquidity (coming soon...)', value: 'manageLiquidity' },
        { name: '3. Stake Assets', value: 'stakeAssets' },
        { name: '4. Deploy a Contract', value: 'deployContract' },
        { name: '5. Deploy a Token', value: 'deployToken' },
        { name: '6. Deploy NFT Collection', value: 'deployNFT' },
        { name: '0. Exit', value: 'exit' },
      ],
    },
  ]);

  switch (option) {
    case 'executeSwaps':
      const { swapChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'swapChoice',
          message: 'Where would you like to swap assets?',
          choices: [
            { name: '1. BeanSwap', value: 'beanSwap' },
            { name: '2. Ambient Finance (coming soon...)', value: 'ambientFinance' },
            { name: '3. KuruSwap', value: 'kuruSwap' },
          ],
        },
      ]);
      if (swapChoice === 'beanSwap') {
        const { beanSwapMode } = await inquirer.prompt([
          {
            type: 'list',
            name: 'beanSwapMode',
            message: 'Select swap mode for BeanSwap:',
            choices: [
              { name: '1. Manual Swaps', value: 'manual' },
              { name: '2. Automatic Swaps', value: 'automatic' },
            ],
          },
        ]);
        if (beanSwapMode === 'manual') {
          console.log('Launching Manual BeanSwap...'.green);
          await runScript('actions/BeanSwap/swap.js');
        } else {
          console.log('Launching Automatic BeanSwap...'.green);
          await runScript('actions/BeanSwap/random.js');
        }
      } else if (swapChoice === 'kuruSwap') {
        const { kuruSwapMode } = await inquirer.prompt([
          {
            type: 'list',
            name: 'kuruSwapMode',
            message: 'Select swap mode for KuruSwap:',
            choices: [
              { name: '1. Manual Swaps', value: 'manual' },
              { name: '2. Automatic Swaps', value: 'automatic' },
            ],
          },
        ]);
        if (kuruSwapMode === 'manual') {
          console.log('Launching Manual KuruSwap...'.green);
          await runScript('actions/KuruSwap/swap.js');
        } else {
          console.log('Launching Automatic KuruSwap...'.green);
          await runScript('actions/KuruSwap/random.js');
        }
      } else {
        console.log('Ambient Finance coming soon...'.green);
      }
      await pause();
      break;

    case 'manageLiquidity':
      console.log('Feature coming soon...'.green);
      await pause();
      break;

    case 'stakeAssets':
      const { stakeChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'stakeChoice',
          message: 'Where would you like to stake assets?',
          choices: [
            { name: '1. Multipli', value: 'multipli' },
            { name: '2. Apriori', value: 'apriori' },
            { name: '3. Kintzu', value: 'kintzu' }
          ],
        },
      ]);
      switch (stakeChoice) {
        case 'multipli':
          console.log('Launching Multipli...'.green);
          await runScript('actions/Multipli/index.js');
          break;
        case 'apriori':
          console.log('Launching Apriori...'.green);
          await runScript('actions/Apriori/index.js');
          break;
        case 'kintzu':
          console.log('Launching Kintzu...'.green);
          await runScript('actions/Kintzu/index.js');
          break;
        default:
          console.log('Invalid option, coming soon...'.green);
          break;
      }
      await pause();
      break;

    case 'deployContract':
      console.log('Launching Deploy Contract...'.green);
      await runScript('actions/deploy_contract/index.js');
      await pause();
      break;

    case 'deployToken':
      console.log('Launching Deploy Token...'.green);
      await runScript('actions/deploy_contract/launch.js');
      await pause();
      break;

    case 'deployNFT':
      console.log('Launching Deploy NFT Collection...'.green);
      await runScript('actions/deploy_contract/NFTs/deploy.js');
      await pause();
      break;

    case 'exit':
      console.log('Exiting...'.green);
      process.exit(0);

    default:
      break;
  }

  mainMenu();
}

mainMenu();

(async () => {
  await getQuote();
})();
