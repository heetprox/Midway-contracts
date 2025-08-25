import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import FakeUSDCModule from "./FakeUSDC";

// LayerZero Endpoint addresses for testnets
const LAYERZERO_ENDPOINTS = {
  "optimism-sepolia": "0x6EDCE65403992e310A62460808c4b910D972f10f",
  "eth-sepolia": "0x6EDCE65403992e310A62460808c4b910D972f10f", 
  "mode-sepolia": "0x6EDCE65403992e310A62460808c4b910D972f10f",
  "zora-sepolia": "0x6EDCE65403992e310A62460808c4b910D972f10f"
};

// LayerZero Chain IDs for testnets
const CHAIN_IDS = {
  "optimism-sepolia": 10232,
  "eth-sepolia": 10161,
  "mode-sepolia": 10260, 
  "zora-sepolia": 10270
};

const MidPayCoreModule = buildModule("MidPayCoreModule", (m) => {
  // Get network name from Hardhat runtime environment
  const networkName = m.getParameter("networkName", "optimism-sepolia");
  
  // Import FakeUSDC
  const { fakeUSDC } = m.useModule(FakeUSDCModule);
  
  // Get LayerZero endpoint for current network
  const lzEndpoint = LAYERZERO_ENDPOINTS[networkName as keyof typeof LAYERZERO_ENDPOINTS];
  const chainId = CHAIN_IDS[networkName as keyof typeof CHAIN_IDS];
  
  if (!lzEndpoint || !chainId) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  // Deploy MidPayCore
  const midPayCore = m.contract("MidPayCore", [fakeUSDC, lzEndpoint]);
  
  // Deploy ExternalRouter
  const externalRouter = m.contract("ExternalRouter", [midPayCore, chainId]);
  
  // Set external router in MidPayCore
  m.call(midPayCore, "setExternalRouter", [externalRouter]);
  
  return { 
    fakeUSDC, 
    midPayCore, 
    externalRouter,
    networkName,
    chainId,
    lzEndpoint 
  };
});

export default MidPayCoreModule;