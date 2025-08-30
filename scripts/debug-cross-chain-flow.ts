// scripts/debug-cross-chain-flow.ts
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function debugCrossChainFlow() {
  const contractsFile = join(__dirname, "../deployed-contracts.json");
  const deployedContracts = JSON.parse(readFileSync(contractsFile, "utf8"));
  
  const [deployer] = await ethers.getSigners();
  console.log("🔍 Debugging Cross-Chain Flow for:", deployer.address);

  // Check all client networks
  const clientNetworks = ["zora-sepolia", "mode-sepolia", "eth-sepolia"];
  
  for (const networkName of clientNetworks) {
    if (!deployedContracts[networkName]) {
      console.log(`⚠️  ${networkName} not deployed, skipping...`);
      continue;
    }

    console.log(`\n🌐 === ${networkName.toUpperCase()} ===`);
    
    // Check if ExternalRouter exists and has messages
    if (deployedContracts[networkName].externalRouter) {
      console.log("📡 Checking ExternalRouter...");
      try {
        const router = await ethers.getContractAt(
          "ExternalRouter", 
          deployedContracts[networkName].externalRouter!
        );
        
        const queueLength = await router.queueLength();
        console.log(`  📬 Messages in queue: ${queueLength}`);
        
        if (queueLength > 0) {
          console.log("  📨 Queued messages:");
          for (let i = 0; i < Math.min(Number(queueLength), 5); i++) {
            const message = await router.messageQueue(i);
            console.log(`    ${i + 1}. Chain ID: ${message.chainId}, Payload: ${message.payload}`);
            
            // Try to decode payload
            try {
              const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                ["address", "uint256", "bool"], 
                message.payload
              );
              console.log(`       Decoded: from=${decoded[0]}, amount=${ethers.formatEther(decoded[1])}, isDeposit=${decoded[2]}`);
            } catch (error) {
              console.log(`       Decode failed: ${error}`);
            }
          }
        }
      } catch (error) {
        console.log(`  ❌ Error checking ExternalRouter: ${error}`);
      }
    }

    // Check MidPayClient events
    if (deployedContracts[networkName].midPay) {
      console.log("📱 Checking MidPayClient...");
      try {
        const client = await ethers.getContractAt(
          "MidPayClient", 
          deployedContracts[networkName].midPay!
        );
        
        // Check recent deposit transactions (last 100 blocks)
        const currentBlock = await ethers.provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 100);
        
        // Check for LzCall events (incoming messages from core)
        const lzCallFilter = client.filters.LzCall();
        const lzCallEvents = await client.queryFilter(lzCallFilter, fromBlock);
        console.log(`  📨 LzCall events (last 100 blocks): ${lzCallEvents.length}`);
        
        // Check LayerZero endpoint configuration
        const endpoint = await client.layerZeroEndpoint();
        console.log(`  🔗 LayerZero Endpoint: ${endpoint}`);
        console.log(`  🎯 Core Address: ${await client.coreAddress()}`);
        console.log(`  🆔 Core Chain ID: ${await client.coreChainId()}`);
        
        // Check trusted remote for Optimism
        const trustedRemote = await client.trustedRemoteLookup(420); // Optimism chain ID
        console.log(`  🤝 Trusted Remote (Chain 420): ${trustedRemote}`);
        
      } catch (error) {
        console.log(`  ❌ Error checking MidPayClient: ${error}`);
      }
    }
  }

  // Check Optimism Core for incoming messages
  console.log(`\n🏛️  === OPTIMISM CORE ===`);
  const midPayCore = await ethers.getContractAt(
    "MidPayCore", 
    deployedContracts["optimism-sepolia"].midPayCore!
  );

  // Check ExternalRouter on Optimism
  if (deployedContracts["optimism-sepolia"].externalRouter) {
    console.log("📡 Checking Optimism ExternalRouter...");
    try {
      const optimismRouter = await ethers.getContractAt(
        "ExternalRouter", 
        deployedContracts["optimism-sepolia"].externalRouter!
      );
      
      const queueLength = await optimismRouter.queueLength();
      console.log(`  📬 Messages in queue: ${queueLength}`);
      
    } catch (error) {
      console.log(`  ❌ Error checking Optimism ExternalRouter: ${error}`);
    }
  }

  // Check recent Core events
  console.log("🏛️  Checking MidPayCore recent events...");
  try {
    const currentBlock = await ethers.provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100);
    
    // Check LzCall events
    const lzCallFilter = midPayCore.filters.LzCall();
    const lzCallEvents = await midPayCore.queryFilter(lzCallFilter, fromBlock);
    console.log(`  📨 LzCall events (last 100 blocks): ${lzCallEvents.length}`);
    
    for (const event of lzCallEvents.slice(-3)) { // Show last 3
      console.log(`    Block ${event.blockNumber}: Chain ${event.args?.srcChainId}, Address ${event.args?.srcAddress}`);
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address", "uint256", "bool"], 
          event.args?.payload || "0x"
        );
        console.log(`      Decoded: from=${decoded[0]}, amount=${ethers.formatEther(decoded[1])}, isDeposit=${decoded[2]}`);
      } catch (error) {
        console.log(`      Decode failed`);
      }
    }
    
    // Check error events
    const errorEvents = [
      { filter: midPayCore.filters.LookupNotTrusted(), name: "LookupNotTrusted" },
      { filter: midPayCore.filters.InvalidEndpoint(), name: "InvalidEndpoint" },
      { filter: midPayCore.filters.HashAlreadyProcessed(), name: "HashAlreadyProcessed" }
    ];

    for (const { filter, name } of errorEvents) {
      const events = await midPayCore.queryFilter(filter, fromBlock);
      if (events.length > 0) {
        console.log(`  ❌ ${name} events: ${events.length}`);
      }
    }
    
  } catch (error) {
    console.log(`  ❌ Error checking Core events: ${error}`);
  }
}

async function main() {
  await debugCrossChainFlow();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
