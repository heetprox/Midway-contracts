// scripts/setup-remotes.ts
import { ethers, network } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

const NETWORKS = {
  "optimism-sepolia": { chainId: 11155420 },
  "eth-sepolia": { chainId: 11155111 },
  "zora-sepolia": { chainId: 999999999 },
  "mode-sepolia": { chainId: 919 },
};

async function setupAllTrustedRemotes() {
  console.log("🔗 Setting up all trusted remote connections...");
  
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  // Setup on Optimism (Core) - connect to all clients
  console.log("\n🏛️ Setting up Optimism Core trusted remotes...");
  
  // Switch to Optimism network for core setup
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
        },
      },
    ],
  });

  const [deployer] = await ethers.getSigners();
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore
  );

  // Set trusted remotes for all client networks
  for (const [networkName, networkConfig] of Object.entries(NETWORKS)) {
    if (networkName === "optimism-sepolia") continue;
    
    const clientAddress = deployedContracts[networkName]?.midPay;
    if (!clientAddress) {
      console.log(`⚠️ Skipping ${networkName} - not deployed`);
      continue;
    }

    const remoteAndLocal = ethers.solidityPacked(
      ["address", "address"],
      [clientAddress, deployedContracts["optimism-sepolia"].midPayCore]
    );

    try {
      const tx = await midPayCore.setTrustedRemoteLookup(networkConfig.chainId, remoteAndLocal);
      await tx.wait();
      console.log(`✅ Set trusted remote for ${networkName} (${networkConfig.chainId})`);
    } catch (error) {
      console.log(`❌ Failed to set trusted remote for ${networkName}:`, error);
    }
  }

  console.log("✅ All trusted remotes configured successfully!");
}

if (require.main === module) {
  setupAllTrustedRemotes().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}