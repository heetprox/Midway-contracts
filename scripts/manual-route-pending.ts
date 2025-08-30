// scripts/manual-route-pending.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function manualRoutePending() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  const [deployer] = await ethers.getSigners();
  console.log("🔧 Manual routing pending messages for:", deployer.address);

  // Connect to Optimism ExternalRouter
  const optimismRouter = await ethers.getContractAt(
    "ExternalRouter", 
    deployedContracts["optimism-sepolia"].externalRouter!
  );

  console.log("📡 Optimism ExternalRouter:", deployedContracts["optimism-sepolia"].externalRouter!);

  // Check queue length
  const queueLength = await optimismRouter.queueLength();
  console.log(`📬 Messages in Optimism queue: ${queueLength}`);

  if (queueLength === 0) {
    console.log("❌ No pending messages in Optimism queue");
    console.log("💡 This means your backend deposits didn't reach Optimism due to RPC errors");
    return;
  }

  // Process all queued messages
  for (let i = 0; i < queueLength; i++) {
    console.log(`\n📨 Processing message ${i + 1}/${queueLength}:`);
    
    try {
      const message = await optimismRouter.messageQueue(i);
      console.log(`  Chain ID: ${message.chainId}`);
      console.log(`  Address Combination: ${message.addressCombination}`);
      console.log(`  Payload: ${message.payload}`);

      // Try to decode the payload
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address", "uint256", "bool"],
          message.payload
        );
        console.log(`  📋 Decoded: from=${decoded[0]}, amount=${ethers.formatEther(decoded[1])}, isDeposit=${decoded[2]}`);
      } catch (error) {
        console.log(`  ⚠️  Could not decode payload`);
      }

      // Route the message
      console.log(`  🚀 Routing message...`);
      const tx = await optimismRouter.route(message);
      await tx.wait();
      console.log(`  ✅ Routed! TX: ${tx.hash}`);

      // Pop the message
      const popTx = await optimismRouter.pop();
      await popTx.wait();
      console.log(`  🗑️  Removed from queue`);

    } catch (error) {
      console.log(`  ❌ Error processing message ${i + 1}:`, error);
      break;
    }
  }

  console.log("\n✅ Manual routing complete!");
}

async function main() {
  await manualRoutePending();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
