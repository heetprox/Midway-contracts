import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    // Local hardhat L1
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },

    // Local hardhat OP stack
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },

    // Ethereum Sepolia
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },

    // Optimism Sepolia
    optimismSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("OPTIMISM_SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },

    // Zora Sepolia
    zoraSepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("ZORA_SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },

    // Mode Sepolia
    modeSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("MODE_SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
};

export default config;
