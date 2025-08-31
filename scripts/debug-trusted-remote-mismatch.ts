// scripts/debug-trusted-remote-mismatch.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";
import { getChainMappings } from "./network-config";
    
async function debugTrustedRemoteMismatch() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  console.log("🔍 Debugging Trusted Remote Mismatch for All Networks...\n");

  // Connect to MidPayCore
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore!
  );

  const optimismMidPayCore = deployedContracts["optimism-sepolia"].midPayCore!;
  console.log("🏛️  Optimism MidPayCore:", optimismMidPayCore);

  // All networks with their chain IDs from centralized configuration
  const networks = getChainMappings();

  for (const network of networks) {
    const clientAddress = deployedContracts[network.name]?.midPay;
    
    if (!clientAddress) {
      console.log(`\n⚠️  ${network.name.toUpperCase()} - Not deployed, skipping...`);
      continue;
    }

    console.log(`\n📋 ${network.name.toUpperCase()} → Optimism Configuration:`);
    console.log(`  Chain ID: ${network.chainId}`);
    console.log(`  MidPayClient: ${clientAddress}`);
    console.log(`  Optimism MidPayCore: ${optimismMidPayCore}`);

    // Check what's currently in trusted remote lookup
    try {
      const currentTrustedRemote = await midPayCore.trustedRemoteLookup(network.chainId);
      console.log(`  Current Trusted Remote: ${currentTrustedRemote}`);

      if (currentTrustedRemote === "0x" || currentTrustedRemote === ethers.ZeroHash) {
        console.log(`  ❌ NO TRUSTED REMOTE SET for chain ${network.chainId}!`);
      }
    } catch (error) {
      console.log("  ❌ Error reading trusted remote:", error);
    }

    console.log("  🔧 Expected Address Combinations:");

    // What your deploy script SHOULD have set
    const expectedForDeposits = ethers.solidityPacked(
      ["address", "address"],
      [clientAddress, optimismMidPayCore]
    );
    console.log(`    For Deposits (Client→Core): ${expectedForDeposits}`);

    // What would be needed for withdrawals (reverse)
    const expectedForWithdrawals = ethers.solidityPacked(
      ["address", "address"], 
      [optimismMidPayCore, clientAddress]
    );
    console.log(`    For Withdrawals (Core→Client): ${expectedForWithdrawals}`);

    // Verify current trusted remote matches expected
    try {
      const currentTrustedRemote = await midPayCore.trustedRemoteLookup(network.chainId);
      if (currentTrustedRemote.toLowerCase() === expectedForDeposits.toLowerCase()) {
        console.log("  ✅ Trusted remote correctly set for deposits!");
      } else if (currentTrustedRemote.toLowerCase() === expectedForWithdrawals.toLowerCase()) {
        console.log("  ⚠️  Trusted remote set for withdrawals (check if this is intended)");
      } else if (currentTrustedRemote !== "0x" && currentTrustedRemote !== ethers.ZeroHash) {
        console.log("  ❌ Trusted remote doesn't match expected format!");
        console.log(`    Current: ${currentTrustedRemote}`);
        console.log(`    Expected: ${expectedForDeposits}`);
      }
    } catch (error) {
      console.log("  ❌ Error verifying trusted remote:", error);
    }
  }

  console.log("\n💡 SOLUTIONS:");
  console.log("1. Run fix-trusted-remotes-simple.ts to set all trusted remotes correctly");
  console.log("2. Check backend relayer is using correct address combinations");
  console.log("3. Verify chain IDs match between contracts and backend");
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
