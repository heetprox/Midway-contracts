import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
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
  networks: {
    hardhat: {
      chainId: 31337,
    },
    
    // Ethereum Sepolia
    "eth-sepolia": {
      url: process.env.ETH_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    
    // Optimism Sepolia  
    "optimism-sepolia": {
      url: process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155420,
    },
    
    // Zora Sepolia
    "zora-sepolia": {
      url: process.env.ZORA_SEPOLIA_RPC_URL || "https://sepolia.rpc.zora.energy",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 999999999,
    },
    
    // Mode Sepolia
    "mode-sepolia": {
      url: process.env.MODE_SEPOLIA_RPC_URL || "https://sepolia.mode.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 919,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      optimismSepolia: process.env.OPTIMISM_ETHERSCAN_API_KEY || "",
      // Add other API keys as needed
    },
  },
};

export default config;