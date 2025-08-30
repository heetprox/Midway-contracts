// scripts/set-zora-trusted-remote.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function setZoraTrustedRemote() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  const [deployer] = await ethers.getSigners();
  console.log("🔧 Setting Zora trusted remote for:", deployer.address);

  // Connect to MidPayCore
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore!
  );

  console.log("🏛️  MidPayCore:", deployedContracts["optimism-sepolia"].midPayCore!);

  // Zora configuration
  const zoraChainId = 9999;
  const zoraClient = deployedContracts["zora-sepolia"].midPay!;
  const optimismCore = deployedContracts["optimism-sepolia"].midPayCore!;

  console.log(`\n🪩 Zora Configuration:`);
  console.log(`  Chain ID: ${zoraChainId}`);
  console.log(`  Client: ${zoraClient}`);
  console.log(`  Core: ${optimismCore}`);

  // What your backend is actually sending (from debug output)
  const backendSentAddress = "0x895ccb29435243f91f637442b489f76b5d8f1a968fd0a253c63ae25f38846cff2fe0e521182636b32";
  
  // What the fix script tried to set (Client + Core)
  const expectedAddress = ethers.solidityPacked(
    ["address", "address"],
    [zoraClient, optimismCore]
  );

  console.log(`\n📨 Address Combinations:`);
  console.log(`  Backend sent: ${backendSentAddress}`);
  console.log(`  Expected: ${expectedAddress}`);

  // Check current trusted remote
  try {
    const currentTrusted = await midPayCore.trustedRemoteLookup(zoraChainId);
    console.log(`  Current: ${currentTrusted}`);

    if (currentTrusted === "0x" || currentTrusted === ethers.ZeroHash) {
      console.log(`\n❌ No trusted remote set for Zora!`);
      console.log(`🔄 Setting trusted remote to match backend format...`);
      
      // Set it to what the backend is actually sending
      const tx = await midPayCore.setTrustedRemoteLookup(zoraChainId, backendSentAddress);
      await tx.wait();
      console.log(`✅ Set trusted remote! TX: ${tx.hash}`);
      
    } else if (currentTrusted.toLowerCase() === expectedAddress.toLowerCase()) {
      console.log(`\n✅ Expected format is already set!`);
      
      // But backend sends different format, so let's update it
      console.log(`🔄 But backend sends different format, updating...`);
      const tx = await midPayCore.setTrustedRemoteLookup(zoraChainId, backendSentAddress);
      await tx.wait();
      console.log(`✅ Updated to match backend! TX: ${tx.hash}`);
      
    } else if (currentTrusted.toLowerCase() === backendSentAddress.toLowerCase()) {
      console.log(`\n✅ Already matches backend format!`);
      
    } else {
      console.log(`\n⚠️  Current trusted remote doesn't match either format!`);
      console.log(`🔄 Setting to match backend...`);
      const tx = await midPayCore.setTrustedRemoteLookup(zoraChainId, backendSentAddress);
      await tx.wait();
      console.log(`✅ Updated! TX: ${tx.hash}`);
    }

    // Verify the final state
    const finalTrusted = await midPayCore.trustedRemoteLookup(zoraChainId);
    console.log(`\n✅ Final trusted remote: ${finalTrusted}`);

  } catch (error) {
    console.log(`❌ Error:`, error);
  }
}

async function main() {
  await setZoraTrustedRemote();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
