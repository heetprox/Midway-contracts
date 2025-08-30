// scripts/check-balance-simple.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function checkBalance() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  const [deployer] = await ethers.getSigners();
  console.log("🔍 Checking balance for:", deployer.address);
  console.log("🌐 Network:", process.env.HARDHAT_NETWORK || "localhost");

  // Connect to MidPayCore on Optimism
  const coreAddress = deployedContracts["optimism-sepolia"]?.midPayCore;
  if (!coreAddress) {
    console.log("❌ MidPayCore not found in deployed contracts");
    return;
  }

  console.log("🏛️  MidPayCore address:", coreAddress);
  
  const midPayCore = await ethers.getContractAt("MidPayCore", coreAddress);

  // Check balance in different formats
  const balanceWei = await midPayCore.balances(deployer.address);
  const balanceEther = ethers.formatEther(balanceWei);
  const balanceUnits = ethers.formatUnits(balanceWei, 18); // Assuming 18 decimals like USDC

  console.log("\n💰 Balance Results:");
  console.log("  Raw Wei:", balanceWei.toString());
  console.log("  Formatted (ether):", balanceEther);
  console.log("  Formatted (18 decimals):", balanceUnits);
  console.log("  Formatted (6 decimals):", ethers.formatUnits(balanceWei, 6));

  // Check USDC contract details
  const usdcAddress = await midPayCore.usdc();
  console.log("\n💵 USDC Token:");
  console.log("  Address:", usdcAddress);
  
  const usdc = await ethers.getContractAt("FakeUSDC", usdcAddress);
  const symbol = await usdc.symbol();
  const decimals = await usdc.decimals();
  const userUsdcBalance = await usdc.balanceOf(deployer.address);
  
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals);
  console.log("  Your USDC token balance:", ethers.formatUnits(userUsdcBalance, decimals));

  // Check contract USDC balance  
  const contractUsdcBalance = await usdc.balanceOf(coreAddress);
  console.log("  Contract USDC balance:", ethers.formatUnits(contractUsdcBalance, decimals));

  // Summary
  console.log("\n📋 SUMMARY:");
  console.log("🎯 Expected Frontend Display:");
  console.log(`   ${ethers.formatUnits(balanceWei, decimals)} ${symbol}`);
  
  if (balanceWei > 0) {
    console.log("\n✅ You DO have a balance! If frontend shows 0, it's a display issue.");
    console.log("🔧 Check frontend is:");
    console.log("   1. Reading from correct contract:", coreAddress);
    console.log("   2. Using correct address:", deployer.address); 
    console.log("   3. Using correct decimals:", decimals);
    console.log("   4. Refreshing after transactions");
  } else {
    console.log("\n❌ Balance is actually 0. Deposits aren't reaching the contract.");
  }
}

async function main() {
  await checkBalance();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
