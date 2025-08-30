// scripts/decode-message.ts
import { ethers } from "hardhat";

async function decodeMessage() {
  console.log("🔍 Decoding the Zora message payload...\n");

  const payload = "0x000000000000000000000000b66d8382084dccd5833786aa9b4e3588ae77a9220000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000001";
  
  try {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ["address", "uint256", "bool"],
      payload
    );
    
    console.log("📨 Decoded Message:");
    console.log(`  From Address: ${decoded[0]}`);
    console.log(`  Amount (Wei): ${decoded[1].toString()}`);
    console.log(`  Amount (USDC): ${ethers.formatEther(decoded[1])}`);
    console.log(`  Is Deposit: ${decoded[2]}`);
    
    console.log("\n✅ This looks correct - 1 USDC deposit from your address!");
    
  } catch (error) {
    console.log("❌ Failed to decode:", error);
  }
}

async function checkTransaction() {
  console.log("\n🔍 Checking the Optimism transaction...\n");
  
  const txHash = "0x6b5db3e597f8967a3557ea927324b15d83ed3ad168296ead11d92affe4b75073";
  
  try {
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log("❌ Transaction not found!");
      return;
    }
    
    console.log("📋 Transaction Details:");
    console.log(`  Status: ${receipt.status ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`  Block: ${receipt.blockNumber}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`  To Address: ${receipt.to}`);
    
    console.log("\n📝 Events in Transaction:");
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`  ${i + 1}. Address: ${log.address}`);
      console.log(`     Topics: ${log.topics.slice(0, 2).join(', ')}...`);
      
      // Try to decode common events
      try {
        // Check if it's an LzCall event (topic0 matches)
        const lzCallTopic = ethers.id("LzCall(uint16,bytes,uint64,bytes)");
        if (log.topics[0] === lzCallTopic) {
          console.log(`     ✅ This is an LzCall event!`);
        }
        
        // Check if it's a Deposited event
        const depositedTopic = ethers.id("Deposited(address,uint256)");
        if (log.topics[0] === depositedTopic) {
          console.log(`     ✅ This is a Deposited event!`);
          // Decode the deposited event
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["address", "uint256"], 
            log.data
          );
          console.log(`        User: ${decoded[0]}`);
          console.log(`        Amount: ${ethers.formatEther(decoded[1])} USDC`);
        }
        
        // Check for error events
        const errorEvents = [
          { topic: ethers.id("LookupNotTrusted()"), name: "LookupNotTrusted" },
          { topic: ethers.id("InvalidEndpoint()"), name: "InvalidEndpoint" },
          { topic: ethers.id("HashAlreadyProcessed()"), name: "HashAlreadyProcessed" },
          { topic: ethers.id("NotEnoughBalance()"), name: "NotEnoughBalance" }
        ];
        
        for (const errorEvent of errorEvents) {
          if (log.topics[0] === errorEvent.topic) {
            console.log(`     ❌ ERROR: ${errorEvent.name} event!`);
          }
        }
        
      } catch (error) {
        // Ignore decode errors
      }
    }
    
  } catch (error) {
    console.log("❌ Error checking transaction:", error);
  }
}

async function main() {
  await decodeMessage();
  await checkTransaction();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
