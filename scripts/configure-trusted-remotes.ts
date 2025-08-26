// scripts/configure-trusted-remotes.ts
import hre from "hardhat";
import { ethers } from "hardhat";
import * as fs from "fs";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    [key: string]: string;
  };
}

// LayerZero Chain IDs
const CHAIN_IDS = {
  "optimism-sepolia": 10232,
  "eth-sepolia": 10161,
  "mode-sepolia": 10260, 
  "zora-sepolia": 10270
};

async function loadIgnitionDeployment(networkName: string, moduleName: string): Promise<any> {
  const deploymentPath = `./ignition/deployments/chain-${getChainIdForNetwork(networkName)}/${moduleName}#${moduleName}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found: ${deploymentPath}`);
  }
  
  return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
}

function getChainIdForNetwork(networkName: string): number {
  const chainIds: Record<string, number> = {
    "optimism-sepolia": 11155420,
    "eth-sepolia": 11155111,
    "mode-sepolia": 919,
    "zora-sepolia": 999999999
  };
  
  return chainIds[networkName];
}

async function getCurrentNetworkName(): Promise<string> {
  return hre.network.name;
}

async function setupTrustedRemotesOnCore() {
  const currentNetwork = await getCurrentNetworkName();
  console.log(`Setting up trusted remotes on CORE network: ${currentNetwork}`);
  
  if (currentNetwork !== "optimism-sepolia") {
    throw new Error("This script must be run on the core network (optimism-sepolia)");
  }
  
  // Load core deployment
  const coreDeployment = await loadIgnitionDeployment(currentNetwork, "MidPayCoreModule");
  const coreAddress = coreDeployment.contracts["MidPayCoreModule#MidPayCore"];
  
  // Load all client deployments
  const clientNetworks = ['eth-sepolia', 'mode-sepolia', 'zora-sepolia'];
  
  // Connect to core contract
  const MidPayCore = await ethers.getContractFactory("MidPayCore");
  const midPayCore = MidPayCore.attach(coreAddress);
  
  console.log("\n=== Setting Trusted Remotes on Core ===");
  
  for (const clientNetwork of clientNetworks) {
    try {
      console.log(`\nSetting trusted remote for ${clientNetwork}...`);
      
      // Load client deployment
      const clientDeployment = await loadIgnitionDeployment(clientNetwork, "MidPayClientModule");
      const clientAddress = clientDeployment.contracts["MidPayClientModule#MidPayClient"];
      
      // Convert client address to bytes (LayerZero format)
      const clientAddressBytes = ethers.utils.solidityPack(["address"], [clientAddress]);
      
      const tx = await midPayCore.setTrustedRemoteLookup(
        CHAIN_IDS[clientNetwork as keyof typeof CHAIN_IDS],
        clientAddressBytes
      );
      await tx.wait();
      
      console.log(`✅ ${clientNetwork} trusted remote set`);
      console.log(`   Chain ID: ${CHAIN_IDS[clientNetwork as keyof typeof CHAIN_IDS]}`);
      console.log(`   Address: ${clientAddress}`);
      
    } catch (error: any) {
      console.log(`⚠️  Skipping ${clientNetwork}: deployment not found or error occurred`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log("\n✅ Core trusted remotes setup complete!");
}

async function setupTrustedRemoteOnClient() {
  const currentNetwork = await getCurrentNetworkName();
  console.log(`Setting up trusted remote on CLIENT network: ${currentNetwork}`);
  
  if (currentNetwork === "optimism-sepolia") {
    throw new Error("This script must be run on a client network, not core");
  }
  
  // Load client deployment
  const clientDeployment = await loadIgnitionDeployment(currentNetwork, "MidPayClientModule");
  const clientAddress = clientDeployment.contracts["MidPayClientModule#MidPayClient"];
  
  // Load core deployment
  const coreDeployment = await loadIgnitionDeployment("optimism-sepolia", "MidPayCoreModule");
  const coreAddress = coreDeployment.contracts["MidPayCoreModule#MidPayCore"];
  
  // Connect to client contract
  const MidPayClient = await ethers.getContractFactory("MidPayClient");
  const midPayClient = MidPayClient.attach(clientAddress);
  
  console.log("\n=== Setting Trusted Remote on Client ===");
  
  // Convert core address to bytes (LayerZero format)
  const coreAddressBytes = ethers.utils.solidityPack(["address"], [coreAddress]);
  
  try {
    // Set trusted remote (core)
    console.log("Setting trusted remote for core...");
    let tx = await midPayClient.setTrustedRemoteLookup(
      CHAIN_IDS["optimism-sepolia"],
      coreAddressBytes
    );
    await tx.wait();
    console.log("✅ Core trusted remote set");
    
    // Update core address if it's still placeholder
    const currentCoreAddress = await midPayClient.coreAddress();
    if (currentCoreAddress === "0x0000000000000000000000000000000000000000") {
      console.log("Updating core address from placeholder...");
      tx = await midPayClient.setCoreAddress(coreAddress);
      await tx.wait();
      console.log("✅ Core address updated");
    } else {
      console.log("✅ Core address already set correctly");
    }
    
  } catch (error) {
    console.error("❌ Failed to setup client trusted remote:", error);
    throw error;
  }
  
  console.log(`\n✅ Client trusted remote setup complete for ${currentNetwork}!`);
  console.log(`Core: ${coreAddress} (Chain ${CHAIN_IDS["optimism-sepolia"]})`);
}

async function main() {
  const currentNetwork = await getCurrentNetworkName();
  
  console.log("🔗 Setting up trusted remotes for MidPay...");
  
  try {
    if (currentNetwork === "optimism-sepolia") {
      await setupTrustedRemotesOnCore();
    } else {
      await setupTrustedRemoteOnClient();
    }
    
    console.log("\n🎉 Trusted remote setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}