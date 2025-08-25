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

const MidPayClientModule = buildModule("MidPayClientModule", (m) => {
  // Get network name and core address from parameters
  const networkName = m.getParameter("networkName", "eth-sepolia");
  const coreAddress = m.getParameter("coreAddress", "0x0000000000000000000000000000000000000000");
  
  // Import FakeUSDC
  const { fakeUSDC } = m.useModule(FakeUSDCModule);
  
  // Get LayerZero endpoint for current network
  const lzEndpoint = LAYERZERO_ENDPOINTS[networkName as unknown as keyof typeof LAYERZERO_ENDPOINTS];
  const chainId = CHAIN_IDS[networkName as unknown as keyof typeof CHAIN_IDS];
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

export default MidPayClientModule;