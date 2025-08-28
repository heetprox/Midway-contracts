import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FakeUSDCModule = buildModule("FakeUSDCModule", (m) => {
  const fakeUSDC = m.contract("FakeUSDC", []);
  return { fakeUSDC };
});

// LayerZero V1 Testnet Endpoints
const LAYERZERO_ENDPOINTS = {
  "optimism-sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
  "eth-sepolia": "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
  "mode-sepolia": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
  "zora-sepolia": "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab"
};

// LayerZero V1 Chain IDs
const LAYERZERO_CHAIN_IDS = {
  "optimism-sepolia": 10232,
  "eth-sepolia": 10161,
  "mode-sepolia": 10260,
  "zora-sepolia": 10270
};


const MidPayClientModule = buildModule("MidPayClientModule", (m) => {
  // Get current network from hardhat config
  const networkName = "mode-sepolia";
  const coreAddress = "0x687fd495E18aBF1DD4aF09a6864d08a21661DC7D"; 
  
  // Import FakeUSDC
  const { fakeUSDC } = m.useModule(FakeUSDCModule);
  
  // Get LayerZero endpoint for current network
  const lzEndpoint = LAYERZERO_ENDPOINTS[networkName];
  const currentChainId = LAYERZERO_CHAIN_IDS[networkName];
  const coreChainId = LAYERZERO_CHAIN_IDS["optimism-sepolia"];
  
  if (!lzEndpoint || !currentChainId) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  if (!coreAddress) {
    throw new Error("Core address not set. Deploy MidPayCore on Optimism first and update CORE_ADDRESSES");
  }
  
  // Deploy MidPayClient
  const midPayClient = m.contract("MidPayClient", [
    fakeUSDC,
    lzEndpoint,
    coreAddress,
    coreChainId
  ]);
  
  // Deploy ExternalRouter
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

export default MidPayClientModule;