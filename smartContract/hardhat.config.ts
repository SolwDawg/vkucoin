import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

// Private keys from your development wallet
// Remove the 0x prefix from the key
// const PRIVATE_KEY = process.env.PRIVATE_KEY?.startsWith("0x")
//   ? process.env.PRIVATE_KEY.substring(2)
//   : process.env.PRIVATE_KEY ||
//     // Default Hardhat account #0 private key without 0x prefix
//     "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337, // Default Hardhat chainId
      mining: {
        auto: true,
        interval: 5000, // Block time in milliseconds (5 seconds)
      },
    },
    // Local node that persists data (for MetaMask connection)
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Etherscan verification config (for verified contracts on testnet/mainnet)
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
