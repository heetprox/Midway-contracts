// scripts/debug-trusted-remote-mismatch.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";
    
async function debugTrustedRemoteMismatch() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  console.log("🔍 Debugging Trusted Remote Mismatch...\n");

  // Connect to MidPayCore
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore!
  );

  // From your backend message: chain ID 9999 (Zora)
  const zoraChainId = 9999;
  const zoraMidPayClient = deployedContracts["zora-sepolia"].midPay!;
  const optimismMidPayCore = deployedContracts["optimism-sepolia"].midPayCore!;

  console.log("📋 Zora → Optimism Configuration:");
  console.log(`  Zora Chain ID: ${zoraChainId}`);
  console.log(`  Zora MidPayClient: ${zoraMidPayClient}`);
  console.log(`  Optimism MidPayCore: ${optimismMidPayCore}`);

  // Check what's currently in trusted remote lookup
  try {
    const currentTrustedRemote = await midPayCore.trustedRemoteLookup(zoraChainId);
    console.log(`  Current Trusted Remote: ${currentTrustedRemote}`);

    if (currentTrustedRemote === "0x" || currentTrustedRemote === ethers.ZeroHash) {
      console.log("  ❌ NO TRUSTED REMOTE SET for chain 9999!");
    }
  } catch (error) {
    console.log("  ❌ Error reading trusted remote:", error);
  }

  console.log("\n🔧 Expected Address Combinations:");

  // What your deploy script SHOULD have set
  const expectedForDeposits = ethers.solidityPacked(
    ["address", "address"],
    [zoraMidPayClient, optimismMidPayCore]
  );
  console.log(`  For Deposits (Client→Core): ${expectedForDeposits}`);

  // What would be needed for withdrawals (reverse)
  const expectedForWithdrawals = ethers.solidityPacked(
    ["address", "address"], 
    [optimismMidPayCore, zoraMidPayClient]
  );
  console.log(`  For Withdrawals (Core→Client): ${expectedForWithdrawals}`);

  console.log("\n📨 Analyzing Your Backend Message:");
  
  // From your backend logs - the address combination sent
  const backendAddressCombination = "0x895ccb29435243f91f637442b489f76b5d8f1a968fd0a253c63ae25f38846cff2fe0e521182636b32";
  console.log(`  Backend Sent: ${backendAddressCombination}`);

  // Check if it matches either expected format
  console.log("\n🔍 Address Combination Analysis:");
  
  if (backendAddressCombination.toLowerCase() === expectedForDeposits.toLowerCase()) {
    console.log("  ✅ Matches expected format for deposits!");
  } else if (backendAddressCombination.toLowerCase() === expectedForWithdrawals.toLowerCase()) {
    console.log("  ✅ Matches expected format for withdrawals!");
  } else {
    console.log("  ❌ DOESN'T match either expected format!");
    
    // Try to parse the backend address combination
    console.log("\n🔬 Dissecting Backend Address Combination:");
    const cleaned = backendAddressCombination.replace("0x", "");
    if (cleaned.length === 80) { // 40 chars per address
      const addr1 = "0x" + cleaned.slice(0, 40);
      const addr2 = "0x" + cleaned.slice(40, 80);
      console.log(`    First Address: ${addr1}`);
      console.log(`    Second Address: ${addr2}`);
      
      // Check if these are the right addresses in wrong order
      if (addr1.toLowerCase() === zoraMidPayClient.toLowerCase()) {
        console.log("    ✅ First address is Zora MidPayClient");
      } else if (addr1.toLowerCase() === optimismMidPayCore.toLowerCase()) {
        console.log("    ✅ First address is Optimism MidPayCore");
      } else {
        console.log("    ❌ First address doesn't match known contracts");
      }
      
      if (addr2.toLowerCase() === zoraMidPayClient.toLowerCase()) {
        console.log("    ✅ Second address is Zora MidPayClient");
      } else if (addr2.toLowerCase() === optimismMidPayCore.toLowerCase()) {
        console.log("    ✅ Second address is Optimism MidPayCore");
      } else {
        console.log("    ❌ Second address doesn't match known contracts");
      }
    }
  }

  console.log("\n💡 SOLUTION:");
  console.log("1. Set trusted remote for chain 9999 to match backend's address combination");
  console.log("2. OR fix backend to send the correct address combination");
  console.log("3. Run the fix-trusted-remotes-simple.ts script to set correct configuration");
}

async function main() {
  await debugTrustedRemoteMismatch();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
