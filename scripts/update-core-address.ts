// scripts/update-core-address.ts
import { ethers } from "hardhat";
import * as fs from "fs";

function getChainIdForNetwork(networkName: string): number {
  const chainIds: Record<string, number> = {
    "optimism-sepolia": 11155420,
    "eth-sepolia": 11155111,
    "mode-sepolia": 919,
    "zora-sepolia": 999999999
  };
  
  return chainIds[networkName];
}

async function loadIgnitionDeployment(networkName: string, moduleName: string): Promise<any> {
  const deploymentPath = `./ignition/deployments/chain-${getChainIdForNetwork(networkName)}/${moduleName}#${moduleName}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found: ${deploymentPath}`);
  }
  
  return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
}

async function updateCoreAddressOnClient(clientNetwork: string, coreAddress: string) {
  console.log(`\nUpdating core address on ${clientNetwork}...`);
  
  // Load client deployment
  const clientDeployment = await loadIgnitionDeployment(clientNetwork, "MidPayClientModule");
  const clientAddress = clientDeployment.contracts["MidPayClientModule#MidPayClient"];
  
  // Connect to client contract
  const MidPayClient = await ethers.getContractFactory("MidPayClient");
  const midPayClient = MidPayClient.attach(clientAddress);
  
  // Check current core address
  const currentCoreAddress = await midPayClient.coreAddress();
  console.log(`Current core address: ${currentCoreAddress}`);
  console.log(`New core address: ${coreAddress}`);
  
  if (currentCoreAddress === coreAddress) {
    console.log(`✅ Core address already correct on ${clientNetwork}`);
    return;
  }
  
  // Update core address
  const tx = await midPayClient.setCoreAddress(coreAddress);
  await tx.wait();
  
  console.log(`✅ Core address updated on ${clientNetwork}`);
}

async function main() {
  console.log("🔄 Updating core addresses on client contracts...");
  
  try {
    // Load core deployment to get the actual core address
    const coreDeployment = await loadIgnitionDeployment("optimism-sepolia", "MidPayCoreModule");
    const coreAddress = coreDeployment.contracts["MidPayCoreModule#MidPayCore"];
    
    console.log(`Core contract address: ${coreAddress}`);
    
    // Update core address on all client networks
    const clientNetworks = ['eth-sepolia', 'mode-sepolia', 'zora-sepolia'];
    
    for (const clientNetwork of clientNetworks) {
      try {
        await updateCoreAddressOnClient(clientNetwork, coreAddress);
      } catch (error :any) {
        console.log(`⚠️  Skipping ${clientNetwork}: ${error.message}`);
      }
    }
    
    console.log("\n🎉 Core address update completed!");
    
  } catch (error) {
    console.error("❌ Update failed:", error);
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