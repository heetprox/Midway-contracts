const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const FakeUSDCModule = require("./FakeUSDC.js");

// LayerZero V1 Testnet Endpoints
const LAYERZERO_ENDPOINTS = {
  "optimism-sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1", // OP Sepolia
  "eth-sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",      // ETH Sepolia  
  "mode-sepolia": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",     // Mode Sepolia
  "zora-sepolia": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab"      // Zora Sepolia
};

// LayerZero V1 Chain IDs (different from v2)
const CHAIN_IDS = {
  "optimism-sepolia": 10232,  // These might be correct
  "eth-sepolia": 10161,       // Need to verify v1 vs v2
  "mode-sepolia": 10260,      
  "zora-sepolia": 10270
};

const MidPayClientModule = buildModule("MidPayClientModule", (m) => {
  // Get network name and core address from parameters
  const networkName = m.getParameter("networkName", "eth-sepolia");
  const coreAddress = m.getParameter("coreAddress", "0x0000000000000000000000000000000000000000");
  
  // Import FakeUSDC
  const { fakeUSDC } = m.useModule(FakeUSDCModule);
  
  // Get LayerZero endpoint for current network
  const lzEndpoint = LAYERZERO_ENDPOINTS[networkName];
  const chainId = CHAIN_IDS[networkName];
  const coreChainId = CHAIN_IDS["optimism-sepolia"]; // Core is always on Optimism Sepolia
  
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

  console.log("lzEndpoint", lzEndpoint);
  console.log("chainId", chainId);
  console.log("coreChainId", coreChainId);
  console.log("coreAddress", coreAddress);
  console.log("fakeUSDC", fakeUSDC);
  console.log("midPayClient", midPayClient);
  
  return { 
    fakeUSDC, 
    midPayClient
  };
});

module.exports = MidPayClientModule;