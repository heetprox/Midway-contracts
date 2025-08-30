// scripts/debug-core-events.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function debugCoreEvents() {
  // Load deployed contracts
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  const [deployer] = await ethers.getSigners();
  console.log("🔍 Debugging MidPayCore events for:", deployer.address);

  // Connect to MidPayCore on Optimism
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore!
  );

  console.log("\n📊 Current balance:", ethers.formatEther(await midPayCore.balances(deployer.address)), "USDC");

  // Check recent events (last 1000 blocks)
  const currentBlock = await ethers.provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 1000);

  console.log(`\n🔍 Checking events from block ${fromBlock} to ${currentBlock}...`);

  // Check LzCall events (incoming messages)
  const lzCallFilter = midPayCore.filters.LzCall();
  const lzCallEvents = await midPayCore.queryFilter(lzCallFilter, fromBlock);
  console.log(`\n📨 LzCall events (incoming messages): ${lzCallEvents.length}`);
  
  for (const event of lzCallEvents) {
    console.log(`  Block ${event.blockNumber}:`, {
      srcChainId: event.args?.srcChainId,
      srcAddress: event.args?.srcAddress,
      nonce: event.args?.nonce?.toString(),
      payload: event.args?.payload
    });
    
    // Try to decode the payload
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address", "uint256", "bool"], 
        event.args?.payload || "0x"
      );
      console.log(`    Decoded: from=${decoded[0]}, amount=${ethers.formatEther(decoded[1])}, isDeposit=${decoded[2]}`);
    } catch (error) {
      console.log(`    Decode error:`, error);
    }
  }

  // Check Deposited events
  const depositedFilter = midPayCore.filters.Deposited();
  const depositedEvents = await midPayCore.queryFilter(depositedFilter, fromBlock);
  console.log(`\n💰 Deposited events: ${depositedEvents.length}`);
  
  for (const event of depositedEvents) {
    console.log(`  Block ${event.blockNumber}: user=${event.args?.user}, amount=${ethers.formatEther(event.args?.amount || 0)}`);
  }

  // Check error events
  const errorEvents = [
    { filter: midPayCore.filters.HashAlreadyProcessed(), name: "HashAlreadyProcessed" },
    { filter: midPayCore.filters.InvalidEndpoint(), name: "InvalidEndpoint" },
    { filter: midPayCore.filters.LookupNotTrusted(), name: "LookupNotTrusted" },
    { filter: midPayCore.filters.NotEnoughBalance(), name: "NotEnoughBalance" }
  ];

  for (const { filter, name } of errorEvents) {
    const events = await midPayCore.queryFilter(filter, fromBlock);
    if (events.length > 0) {
      console.log(`\n❌ ${name} events: ${events.length}`);
      events.forEach((event, i) => {
        console.log(`  ${i + 1}. Block ${event.blockNumber}`);
      });
    }
  }

  // Check trusted remotes configuration
  console.log("\n🔗 Trusted Remote Configuration:");
  const networks = ["zora-sepolia", "mode-sepolia", "eth-sepolia"];
  const chainIds = [9999, 9998, 111]; // From your deploy script
  
  for (let i = 0; i < networks.length; i++) {
    try {
      const trustedRemote = await midPayCore.trustedRemoteLookup(chainIds[i]);
      console.log(`  Chain ${chainIds[i]} (${networks[i]}): ${trustedRemote}`);
      
      if (trustedRemote === "0x") {
        console.log(`    ⚠️  No trusted remote set for ${networks[i]}!`);
      }
    } catch (error) {
      console.log(`  Chain ${chainIds[i]}: Error reading trusted remote`);
    }
  }
}

async function main() {
  await debugCoreEvents();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
