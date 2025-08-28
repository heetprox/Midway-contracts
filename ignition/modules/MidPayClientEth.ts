import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FakeUSDCModule = buildModule("FakeUSDCModule", (m) => {
  const fakeUSDC = m.contract("FakeUSDC", []);
  return { fakeUSDC };
});

// LayerZero V1 Testnet Endpoints
const LAYERZERO_ENDPOINTS = {
  "optimism-sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1", // OP Sepolia
  "eth-sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",      // ETH Sepolia  
  "mode-sepolia": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",     // Mode Sepolia
  "zora-sepolia": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab"      // Zora Sepolia
};

// LayerZero V1 Chain IDs (different from v2)
const LAYERZERO_CHAIN_IDS = {
  "optimism-sepolia": 10232,  // These might be correct
  "eth-sepolia": 10161,       // Need to verify v1 vs v2
  "mode-sepolia": 10260,      
  "zora-sepolia": 10270
};

const MidPayClientEthModule = buildModule("MidPayClientEthModule", (m) => {
  // Import FakeUSDC
  const { fakeUSDC } = m.useModule(FakeUSDCModule);
  
  // Hardcoded for Ethereum Sepolia
  const networkName = "eth-sepolia";
  const coreAddress = "0x687fd495E18aBF1DD4aF09a6864d08a21661DC7D"; // Core contract address
  
  // Get LayerZero endpoint for current network
  const lzEndpoint = LAYERZERO_ENDPOINTS[networkName];
  const currentChainId = LAYERZERO_CHAIN_IDS[networkName];
  const chainId = LAYERZERO_CHAIN_IDS[networkName];
  const coreChainId = LAYERZERO_CHAIN_IDS["optimism-sepolia"]; // Core is always on Optimism Sepolia
  
  if (!lzEndpoint || !chainId) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  // Deploy MidPayClient
  const midPayClient = m.contract("MidPayClient", [
    fakeUSDC,
    lzEndpoint,
    coreAddress,
    coreChainId
  ]);

  const externalRouter = m.contract("ExternalRouter", [
    midPayClient,
    currentChainId
  ]);
  
  console.log(`Deploying on ${networkName}:`);
  console.log("lzEndpoint:", lzEndpoint);
  console.log("currentChainId:", currentChainId);
  console.log("coreAddress:", coreAddress);
  console.log("coreChainId:", coreChainId);
  
  return { 
    fakeUSDC, 
    midPayClient,
    externalRouter
  };
});

export default MidPayClientEthModule;
