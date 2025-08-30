// scripts/verify-deployments.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function verifyDeployments() {
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  console.log("🔍 Verifying all deployed contract addresses...\n");

  for (const [networkName, contracts] of Object.entries(deployedContracts)) {
    console.log(`🌐 ${networkName.toUpperCase()}:`);
    
    for (const [contractType, address] of Object.entries(contracts as any)) {
      if (typeof address === 'string' && address.startsWith('0x')) {
        console.log(`  ${contractType}: ${address}`);
        
        try {
          // Try to get contract code
          const provider = ethers.provider;
          const code = await provider.getCode(address);
          
          if (code === '0x') {
            console.log(`    ❌ NO CONTRACT CODE - address is empty!`);
          } else {
            console.log(`    ✅ Contract exists (${code.length} bytes)`);
          }
        } catch (error) {
          console.log(`    ❌ Error checking: ${error}`);
        }
      }
    }
    console.log();
  }
}

async function main() {
  await verifyDeployments();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
