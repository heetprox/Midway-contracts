// scripts/network-config.ts
// Centralized network configuration to ensure consistency across all scripts

export interface NetworkConfig {
  chainId: number;
  externalRouterChainId: number;
  layerZeroEndpoint: string | null;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  "optimism-sepolia": {
    chainId: 11155420,
    externalRouterChainId: 420,
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  },
  "eth-sepolia": {
    chainId: 11155111,
    externalRouterChainId: 111,
    layerZeroEndpoint: null,
  },
  "zora-sepolia": {
    chainId: 999999999,
    externalRouterChainId: 9999,
    layerZeroEndpoint: null,
  },
  "base-sepolia": {
    chainId: 84532,
    externalRouterChainId: 845,
    layerZeroEndpoint: null,
  },
  "worldchain-sepolia": {
    chainId: 4801,
    externalRouterChainId: 480,
    layerZeroEndpoint: null,
  },
  "ink-sepolia": {
    chainId: 763373,
    externalRouterChainId: 763,
    layerZeroEndpoint: null,
  },
  "unichain-sepolia": {
    chainId: 1301,
    externalRouterChainId: 130,
    layerZeroEndpoint: null,
  },
  "polygon-amoy": {
    chainId: 80002,
    externalRouterChainId: 800,
    layerZeroEndpoint: null,
  },
};

// Helper function to get all client networks (excluding Optimism core)
export function getClientNetworks(): string[] {
  return Object.keys(NETWORKS).filter(name => name !== "optimism-sepolia");
}

// Helper function to get chain mapping for trusted remotes
export function getChainMappings(): Array<{ name: string; chainId: number }> {
  return getClientNetworks().map(name => ({
    name,
    chainId: NETWORKS[name].externalRouterChainId
  }));
}

// Helper function to get network config by name
export function getNetworkConfig(networkName: string): NetworkConfig | undefined {
  return NETWORKS[networkName];
}
