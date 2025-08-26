import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import FakeUSDCModule from "./FakeUSDC";

// LayerZero Endpoint addresses for testnets
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

const MidPayCoreModule = buildModule("MidPayCoreModule", (m) => {
  // Get network name from Hardhat runtime environment
  const networkName = m.getParameter("networkName", "optimism-sepolia");
  
  // Import FakeUSDC
  const { fakeUSDC } = m.useModule(FakeUSDCModule);
  
  // Get LayerZero endpoint for current network
  const lzEndpoint = LAYERZERO_ENDPOINTS[networkName as unknown as keyof typeof LAYERZERO_ENDPOINTS];
  const chainId = CHAIN_IDS[networkName as unknown as keyof typeof CHAIN_IDS];
  
  if (!lzEndpoint || !chainId) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  // Deploy MidPayCore
  const midPayCore = m.contract("MidPayCore", [fakeUSDC, lzEndpoint]);
  
  // Deploy ExternalRouter
  const externalRouter = m.contract("ExternalRouter", [midPayCore, chainId]);
  
  // Set external router in MidPayCore
  m.call(midPayCore, "setExternalRouter", [externalRouter]);


  console.log("lzEndpoint", lzEndpoint);
  console.log("chainId", chainId);
  console.log("fakeUSDC", fakeUSDC);
  console.log("midPayCore", midPayCore);
  console.log("externalRouter", externalRouter);
  
  return { 
    fakeUSDC, 
    midPayCore, 
    externalRouter
  };
});

export default MidPayCoreModule;