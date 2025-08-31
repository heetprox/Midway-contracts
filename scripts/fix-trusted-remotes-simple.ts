// scripts/fix-trusted-remotes-simple.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";
import { getChainMappings } from "./network-config";

async function fixTrustedRemotes() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  const [deployer] = await ethers.getSigners();
  console.log("🔧 Fixing trusted remotes for:", deployer.address);

  // Connect to MidPayCore on Optimism
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore!
  );

  console.log("🏛️  MidPayCore:", deployedContracts["optimism-sepolia"].midPayCore!);

  // Chain ID mapping from centralized network configuration
  const chainMappings = getChainMappings().map(mapping => ({
    ...mapping,
    clientAddress: deployedContracts[mapping.name]?.midPay
  }));

  for (const mapping of chainMappings) {
    if (!mapping.clientAddress) {
      console.log(`⚠️  Skipping ${mapping.name} - not deployed`);
      continue;
    }

    console.log(`\n🔗 Setting up ${mapping.name} (Chain ID: ${mapping.chainId}):`);
    console.log(`  Client Address: ${mapping.clientAddress}`);
    console.log(`  Core Address: ${deployedContracts["optimism-sepolia"].midPayCore!}`);

    // Create the expected address combination (CLIENT + CORE)
    const expectedRemote = ethers.solidityPacked(
      ["address", "address"],
      [mapping.clientAddress, deployedContracts["optimism-sepolia"].midPayCore!]
    );

    console.log(`  Expected Remote: ${expectedRemote}`);

    // Check current trusted remote
    try {
      const currentTrusted = await midPayCore.trustedRemoteLookup(mapping.chainId);
      console.log(`  Current Trusted: ${currentTrusted}`);

      if (currentTrusted.toLowerCase() === expectedRemote.toLowerCase()) {
        console.log(`  ✅ Already correct!`);
      } else {
        console.log(`  🔄 Updating trusted remote...`);
        const tx = await midPayCore.setTrustedRemoteLookup(mapping.chainId, expectedRemote);
        await tx.wait();
        console.log(`  ✅ Updated! TX: ${tx.hash}`);
      }
    } catch (error) {
      console.log(`  ❌ Error:`, error);
    }
  }

  console.log("\n🔍 Verifying all trusted remotes:");
  for (const mapping of chainMappings) {
    if (!mapping.clientAddress) continue;
    
    try {
      const trustedRemote = await midPayCore.trustedRemoteLookup(mapping.chainId);
      console.log(`  Chain ${mapping.chainId} (${mapping.name}): ${trustedRemote}`);
    } catch (error) {
      console.log(`  Chain ${mapping.chainId}: Error reading`);
    }
  }
}

async function main() {
  await fixTrustedRemotes();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
