// scripts/check-zora-queue.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function checkZoraQueue() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  console.log("🔍 Checking Zora ExternalRouter queue...");

  try {
    // Connect to Zora ExternalRouter
    const zoraRouter = await ethers.getContractAt(
      "ExternalRouter", 
      deployedContracts["zora-sepolia"].externalRouter!
    );

    console.log("📡 Zora ExternalRouter:", deployedContracts["zora-sepolia"].externalRouter!);

    // Check queue length
    const queueLength = await zoraRouter.queueLength();
    console.log(`📬 Messages in Zora queue: ${queueLength}`);

    if (queueLength === 0) {
      console.log("✅ No messages stuck in Zora queue - backend processed them correctly");
      console.log("💡 The issue is that backend couldn't send them to Optimism due to RPC errors");
      return;
    }

    // Show queued messages
    console.log(`\n📨 Stuck messages in Zora queue:`);
    for (let i = 0; i < Math.min(Number(queueLength), 5); i++) {
      const message = await zoraRouter.messageQueue(i);
      console.log(`\n  Message ${i + 1}:`);
      console.log(`    Chain ID: ${message.chainId}`);
      console.log(`    Address: ${message.addressCombination}`);
      console.log(`    Payload: ${message.payload}`);

      // Try to decode
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address", "uint256", "bool"],
          message.payload
        );
        console.log(`    📋 Decoded: from=${decoded[0]}, amount=${ethers.formatEther(decoded[1])}, isDeposit=${decoded[2]}`);
      } catch (error) {
        console.log(`    ⚠️  Could not decode payload`);
      }
    }

    console.log(`\n💡 These messages are stuck because backend couldn't route them to Optimism`);
    console.log(`🔧 Solutions:`);
    console.log(`   1. Fix RPC connection and restart backend`);
    console.log(`   2. Manually route these messages once RPC is working`);

  } catch (error) {
    console.log("❌ Error checking Zora queue:", error);
    console.log("💡 This might be an RPC issue on Zora network too");
  }
}

async function main() {
  await checkZoraQueue();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
