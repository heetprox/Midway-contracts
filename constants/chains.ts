// constants/chains.ts
// LayerZero V2 Chain IDs and Configurations
// Use these exact IDs across deploy script, contracts, and backend

export interface ChainConfig {
  name: string;
  chainId: number; // Real blockchain chain ID
  layerZeroChainId: number; // LayerZero V2 endpoint ID
  layerZeroEndpoint: string | null; // LayerZero V2 endpoint address
  rpcUrl?: string; // Will be set from env
  isTestnet: boolean;
}

// ==========================================
// TESTNET CONFIGURATIONS (Use these for your current setup)
// ==========================================

export const TESTNET_CHAINS: Record<string, ChainConfig> = {
  // ==========================================
  // YOUR CURRENT DEPLOYED CONFIGURATION
  // ==========================================

  // Ethereum Sepolia  
  "eth-sepolia": {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    layerZeroChainId: 111, // YOUR custom ID (matches deploy script)
    layerZeroEndpoint: null, // Use ExternalRouter in your setup
    isTestnet: true,
  },

  // Optimism Sepolia (CORE CHAIN)
  "optimism-sepolia": {
    name: "Optimism Sepolia", 
    chainId: 11155420,
    layerZeroChainId: 420, // YOUR custom ID (matches deploy script + backend)
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Has native LZ
    isTestnet: true,
  },

  // Zora Sepolia - Using ExternalRouter
  "zora-sepolia": {
    name: "Zora Sepolia",
    chainId: 999999999,
    layerZeroChainId: 9999, // YOUR custom ID (matches deploy script + backend)
    layerZeroEndpoint: null, // Use ExternalRouter
    isTestnet: true,
  },

  // Mode Sepolia - Using ExternalRouter  
  "mode-sepolia": {
    name: "Mode Sepolia",
    chainId: 919,
    layerZeroChainId: 9998, // YOUR custom ID (matches deploy script + backend)
    layerZeroEndpoint: null, // Use ExternalRouter
    isTestnet: true,
  },

  // ==========================================
  // ADDITIONAL OFFICIAL LAYERZERO V2 CHAINS (for future expansion)
  // ==========================================

  // Base Sepolia
  "base-sepolia": {
    name: "Base Sepolia",
    chainId: 84532,
    layerZeroChainId: 40245, // Official LayerZero V2 endpoint ID
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    isTestnet: true,
  },

  // Arbitrum Sepolia
  "arbitrum-sepolia": {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    layerZeroChainId: 40231, // Official LayerZero V2 endpoint ID
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f", 
    isTestnet: true,
  },

  // Polygon Amoy
  "polygon-amoy": {
    name: "Polygon Amoy",
    chainId: 80002,
    layerZeroChainId: 40267, // Official LayerZero V2 endpoint ID
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    isTestnet: true,
  },
};

// ==========================================
// MAINNET CONFIGURATIONS (For production)
// ==========================================

export const MAINNET_CHAINS: Record<string, ChainConfig> = {
  // Ethereum Mainnet
  "ethereum": {
    name: "Ethereum",
    chainId: 1,
    layerZeroChainId: 30101, // LayerZero V2 endpoint ID for Ethereum
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Optimism Mainnet
  "optimism": {
    name: "Optimism",
    chainId: 10,
    layerZeroChainId: 30111, // LayerZero V2 endpoint ID for Optimism
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Base Mainnet
  "base": {
    name: "Base",
    chainId: 8453,
    layerZeroChainId: 30184, // LayerZero V2 endpoint ID for Base
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Arbitrum One
  "arbitrum": {
    name: "Arbitrum One", 
    chainId: 42161,
    layerZeroChainId: 30110, // LayerZero V2 endpoint ID for Arbitrum
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Polygon Mainnet
  "polygon": {
    name: "Polygon",
    chainId: 137,
    layerZeroChainId: 30109, // LayerZero V2 endpoint ID for Polygon
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c", 
    isTestnet: false,
  },

  // BSC Mainnet
  "bsc": {
    name: "BNB Smart Chain",
    chainId: 56,
    layerZeroChainId: 30102, // LayerZero V2 endpoint ID for BSC
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Avalanche C-Chain
  "avalanche": {
    name: "Avalanche",
    chainId: 43114, 
    layerZeroChainId: 30106, // LayerZero V2 endpoint ID for Avalanche
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Fantom Mainnet
  "fantom": {
    name: "Fantom",
    chainId: 250,
    layerZeroChainId: 30112, // LayerZero V2 endpoint ID for Fantom  
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    isTestnet: false,
  },

  // Zora Mainnet - No native LayerZero V2 support yet
  "zora": {
    name: "Zora Network",
    chainId: 7777777,
    layerZeroChainId: 40777, // Custom ID for ExternalRouter
    layerZeroEndpoint: null, // Use ExternalRouter
    isTestnet: false,
  },

  // Mode Mainnet - No native LayerZero V2 support yet
  "mode": {
    name: "Mode Network", 
    chainId: 34443,
    layerZeroChainId: 40344, // Custom ID for ExternalRouter
    layerZeroEndpoint: null, // Use ExternalRouter
    isTestnet: false,
  },
};

// ==========================================
// ENVIRONMENT-BASED CONFIGURATION
// ==========================================

export const IS_TESTNET = process.env.NODE_ENV !== "production";
export const CHAINS = IS_TESTNET ? TESTNET_CHAINS : MAINNET_CHAINS;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getChainConfig(networkName: string): ChainConfig {
  const config = CHAINS[networkName];
  if (!config) {
    throw new Error(`Network ${networkName} not found in chain configurations`);
  }
  return config;
}

export function getLayerZeroChainId(networkName: string): number {
  return getChainConfig(networkName).layerZeroChainId;
}

export function hasNativeLayerZero(networkName: string): boolean {
  return getChainConfig(networkName).layerZeroEndpoint !== null;
}

export function getAllNetworkNames(): string[] {
  return Object.keys(CHAINS);
}

export function getNetworksByLayerZeroSupport() {
  const native: string[] = [];
  const external: string[] = [];
  
  for (const [name, config] of Object.entries(CHAINS)) {
    if (config.layerZeroEndpoint) {
      native.push(name);
    } else {
      external.push(name);
    }
  }
  
  return { native, external };
}

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
// In deploy script:
import { TESTNET_CHAINS, getLayerZeroChainId } from "./constants/chains";

const optimismConfig = TESTNET_CHAINS["optimism-sepolia"];
const zoraChainId = getLayerZeroChainId("zora-sepolia"); // 40999

// In contracts:
// Use config.layerZeroChainId for all cross-chain messaging

// In backend:
import { TESTNET_CHAINS } from "./constants/chains";

const CHAIN_CONFIGS = {
  optimism: {
    chainId: TESTNET_CHAINS["optimism-sepolia"].layerZeroChainId, // 40232
    routerAddress: OptimismRouter,
  },
  zora: {
    chainId: TESTNET_CHAINS["zora-sepolia"].layerZeroChainId, // 40999
    routerAddress: ZoraRouter,
  }
};
*/

// ==========================================
// USAGE WITH YOUR CURRENT DEPLOYED SETUP
// ==========================================

/*
YOUR CURRENT CONFIGURATION IS NOW MATCHED:

✅ Deploy Script Chain IDs (your current deploy.ts):
- Optimism: 420 
- Zora: 9999
- Mode: 9998  
- Eth: 111

✅ Backend Chain IDs (your current server.ts):
- Optimism: 420n
- Zora: 9999n  
- Mode: 9998n

✅ This constants file now matches both!

TO USE THIS FILE (optional - for consistency):

1. In deploy.ts, you can replace hardcoded values with:
   import { TESTNET_CHAINS } from "../constants/chains";
   
   const NETWORKS = {
     "optimism-sepolia": {
       chainId: TESTNET_CHAINS["optimism-sepolia"].chainId, // 11155420
       externalRouterChainId: TESTNET_CHAINS["optimism-sepolia"].layerZeroChainId, // 420
       layerZeroEndpoint: TESTNET_CHAINS["optimism-sepolia"].layerZeroEndpoint,
     },
     // ... etc
   };

2. In server.ts, you can replace hardcoded values with:
   import { TESTNET_CHAINS } from "../constants/chains";
   
   const CHAIN_CONFIGS = {
     optimism: {
       chainId: BigInt(TESTNET_CHAINS["optimism-sepolia"].layerZeroChainId), // 420n
       routerAddress: OptimismRouter,
     },
     // ... etc
   };

BUT YOUR CURRENT SETUP SHOULD ALREADY WORK since the IDs match!
*/
