// hardhat.config.ts - Updated configuration
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
import "hardhat-gas-reporter";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config();

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
  // Add TypeScript support
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // Ethereum Sepolia
    "eth-sepolia": {
      url: process.env.ETH_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
    },
    // Optimism Sepolia
    "optimism-sepolia": {
      url: process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155420,
      gasPrice: "auto",
    },
    // Zora Sepolia
    "zora-sepolia": {
      url: process.env.ZORA_SEPOLIA_RPC_URL || "https://sepolia.rpc.zora.energy",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 999999999,
      gasPrice: "auto",
    },
    // Base Sepolia
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: "auto",
    },
    // Worldchain Sepolia
    "worldchain-sepolia": {
      url: process.env.WORLDCHAIN_SEPOLIA_RPC_URL || "https://worldchain-sepolia.g.alchemy.com/public",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 4801,
      gasPrice: "auto",
    },
    // Ink Sepolia
    "ink-sepolia": {
      url: process.env.INK_SEPOLIA_RPC_URL || "https://rpc-gel-sepolia.inkonchain.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 763373,
      gasPrice: "auto",
    },
    // Unichain Sepolia
    "unichain-sepolia": {
      url: process.env.UNICHAIN_SEPOLIA_RPC_URL || "https://sepolia.unichain.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1301,
      gasPrice: "auto",
    },
    // Polygon Amoy (Testnet)
    "polygon-amoy": {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;