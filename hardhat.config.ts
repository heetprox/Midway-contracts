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
    // Wanchain Sepolia
    "wanchain-sepolia": {
      url: process.env.WANCHAIN_SEPOLIA_RPC_URL || "https://gwan-ssl.wandevs.org:46891",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 999, // Update with actual Wanchain Sepolia chain ID
      gasPrice: "auto",
    },
    // Inks Sepolia
    "inks-sepolia": {
      url: process.env.INKS_SEPOLIA_RPC_URL || "https://rpc-gel-sepolia.inkonchain.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 763373, // Update with actual Inks Sepolia chain ID
      gasPrice: "auto",
    },
    // Unilayer Sepolia
    "unilayer-sepolia": {
      url: process.env.UNILAYER_SEPOLIA_RPC_URL || "https://sepolia-rpc.unilayer.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2777, // Update with actual Unilayer Sepolia chain ID
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
      optimismSepolia: process.env.OPTIMISM_ETHERSCAN_API_KEY || "",
      zoraSepolia: process.env.ZORA_ETHERSCAN_API_KEY || "",
      baseSepolia: process.env.BASE_ETHERSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGON_ETHERSCAN_API_KEY || "",
      wanchainSepolia: process.env.WANCHAIN_ETHERSCAN_API_KEY || "",
      inksSepolia: process.env.INKS_ETHERSCAN_API_KEY || "",
      unilayerSepolia: process.env.UNILAYER_ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;