// scripts/deploy.ts
import { ethers } from "hardhat";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Network configurations - Updated to match relayer chain IDs
const NETWORKS = {
  "optimism-sepolia": {
    chainId: 11155420,
    externalRouterChainId: 420, // Keep existing for Optimism
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  },
  "eth-sepolia": {
    chainId: 11155111,
    externalRouterChainId: 111,
    layerZeroEndpoint: null,
  },
  "zora-sepolia": {
    chainId: 999999999,
    externalRouterChainId: 9999, // Updated to match relayer
    layerZeroEndpoint: null, // Will use ExternalRouter
  },
  "base-sepolia": {
    chainId: 84532,
    externalRouterChainId: 845,
    layerZeroEndpoint: null, // Will use ExternalRouter
  },
  "worldchain-sepolia": {
    chainId: 4801,
    externalRouterChainId: 480,
    layerZeroEndpoint: null, // Will use ExternalRouter
  },
  "ink-sepolia": {
    chainId: 763373,
    externalRouterChainId: 763,
    layerZeroEndpoint: null, // Will use ExternalRouter
  },
  "unichain-sepolia": {
    chainId: 1301,
    externalRouterChainId: 130,
    layerZeroEndpoint: null, // Will use ExternalRouter
  },
  "polygon-amoy": {
    chainId: 80002,
    externalRouterChainId: 800,
    layerZeroEndpoint: null, // Will use ExternalRouter
  },
};

interface DeployedContracts {
  [key: string]: {
    usdc?: string;
    midPayCore?: string;
    midPay?: string;
    externalRouter?: string;
  };
}

class MidPayDeployer {
  private deployedContracts: DeployedContracts = {};
  private deployer: any;
  private contractsFile = join(__dirname, "../deployed-contracts.json");

  constructor() {
    this.loadExistingContracts();
  }

  private loadExistingContracts() {
    if (existsSync(this.contractsFile)) {
      try {
        const data = readFileSync(this.contractsFile, "utf8");
        this.deployedContracts = JSON.parse(data);
        console.log("📁 Loaded existing contract addresses");
      } catch (error) {
        console.log("⚠️  Could not load existing contracts, starting fresh");
      }
    }
  }

  private saveContracts() {
    writeFileSync(
      this.contractsFile,
      JSON.stringify(this.deployedContracts, null, 2)
    );
    console.log("💾 Saved contract addresses to", this.contractsFile);
  }

  async deployToNetwork(networkName: string) {
    const networkConfig = NETWORKS[networkName as keyof typeof NETWORKS];
    if (!networkConfig) {
      throw new Error(`Network ${networkName} not supported`);
    }

    console.log(`\n🚀 Deploying to ${networkName} (Chain ID: ${networkConfig.chainId})`);
    console.log(`🆔 External Router Chain ID: ${networkConfig.externalRouterChainId}`);
    
    // Get deployer
    [this.deployer] = await ethers.getSigners();
    console.log("👤 Deployer address:", this.deployer.address);
    
    const balance = await ethers.provider.getBalance(this.deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

    // Initialize network object if it doesn't exist
    if (!this.deployedContracts[networkName]) {
      this.deployedContracts[networkName] = {};
    }

    // Deploy FakeUSDC
    await this.deployFakeUSDC(networkName);

    // Deploy based on network type
    if (networkName === "optimism-sepolia") {
      await this.deployOptimismCore(networkName, networkConfig);
    } else {
      await this.deployClientNetwork(networkName, networkConfig);
    }

    this.saveContracts();
  }

  private async deployFakeUSDC(networkName: string) {
    if (this.deployedContracts[networkName].usdc) {
      console.log("✅ FakeUSDC already deployed:", this.deployedContracts[networkName].usdc);
      return;
    }

    console.log("📄 Deploying FakeUSDC...");
    const FakeUSDC = await ethers.getContractFactory("FakeUSDC");
    const usdc = await FakeUSDC.deploy();
    await usdc.waitForDeployment();

    this.deployedContracts[networkName].usdc = await usdc.getAddress();
    console.log("✅ FakeUSDC deployed:", this.deployedContracts[networkName].usdc);

    // Mint tokens to deployer
    const mintTx = await usdc.mint(this.deployer.address, ethers.parseEther("1000000"));
    await mintTx.wait();
    console.log("💰 Minted 1M USDC to deployer");
  }

  private async deployOptimismCore(networkName: string, networkConfig: any) {
    // Deploy MidPayCore
    if (!this.deployedContracts[networkName].midPayCore) {
      console.log("📄 Deploying MidPayCore...");
      const MidPayCore = await ethers.getContractFactory("MidPayCore");
      const midPayCore = await MidPayCore.deploy(
        this.deployedContracts[networkName].usdc!,
        networkConfig.layerZeroEndpoint
      );
      await midPayCore.waitForDeployment();

      this.deployedContracts[networkName].midPayCore = await midPayCore.getAddress();
      console.log("✅ MidPayCore deployed:", this.deployedContracts[networkName].midPayCore);

      // Fund and setup MidPayCore
      const usdc = await ethers.getContractAt("FakeUSDC", this.deployedContracts[networkName].usdc!);
      
      // Mint USDC to MidPayCore
      const mintTx = await usdc.mint(this.deployedContracts[networkName].midPayCore!, ethers.parseEther("1000000"));
      await mintTx.wait();
      console.log("💰 Minted 1M USDC to MidPayCore");

      // Approve USDC spending
      const approveTx = await usdc.approve(this.deployedContracts[networkName].midPayCore!, ethers.MaxUint256);
      await approveTx.wait();
      console.log("✅ Approved unlimited USDC spending for MidPayCore");

      // Fund with ETH
      const fundTx = await this.deployer.sendTransaction({
        to: this.deployedContracts[networkName].midPayCore!,
        value: ethers.parseEther("0.01")
      });
      await fundTx.wait();
      console.log("💰 Funded MidPayCore with 0.01 ETH");
    }

    // Deploy ExternalRouter for Optimism
    if (!this.deployedContracts[networkName].externalRouter) {
      console.log("📄 Deploying ExternalRouter for Optimism...");
      const ExternalRouter = await ethers.getContractFactory("ExternalRouter");
      const externalRouter = await ExternalRouter.deploy(
        this.deployedContracts[networkName].midPayCore!,
        networkConfig.externalRouterChainId
      );
      await externalRouter.waitForDeployment();

      this.deployedContracts[networkName].externalRouter = await externalRouter.getAddress();
      console.log("✅ ExternalRouter deployed:", this.deployedContracts[networkName].externalRouter);

      // Set external router on MidPayCore
      const midPayCore = await ethers.getContractAt("MidPayCore", this.deployedContracts[networkName].midPayCore!);
      const setRouterTx = await midPayCore.setExternalRouter(this.deployedContracts[networkName].externalRouter!);
      await setRouterTx.wait();
      console.log("✅ Set ExternalRouter on MidPayCore");
    }
  }

  private async deployClientNetwork(networkName: string, networkConfig: any) {
    // Get Optimism MidPayCore address
    const optimismCore = this.deployedContracts["optimism-sepolia"]?.midPayCore;
    if (!optimismCore) {
      throw new Error("MidPayCore must be deployed on Optimism first");
    }

    // Deploy MidPay client
    if (!this.deployedContracts[networkName].midPay) {
      console.log("📄 Deploying MidPayClient...");
      const MidPayClient = await ethers.getContractFactory("MidPayClient");
      const midPay = await MidPayClient.deploy(
        this.deployedContracts[networkName].usdc!,
        networkConfig.layerZeroEndpoint || ethers.ZeroAddress, // Use zero address if no native endpoint
        optimismCore,
        NETWORKS["optimism-sepolia"].externalRouterChainId // Core chain ID
      );
      await midPay.waitForDeployment();

      this.deployedContracts[networkName].midPay = await midPay.getAddress();
      console.log("✅ MidPayClient deployed:", this.deployedContracts[networkName].midPay);

      // Fund and setup MidPayClient
      const usdc = await ethers.getContractAt("FakeUSDC", this.deployedContracts[networkName].usdc!);
      
      // Mint USDC to MidPayClient
      const mintTx = await usdc.mint(this.deployedContracts[networkName].midPay!, ethers.parseEther("1000000"));
      await mintTx.wait();
      console.log("💰 Minted 1M USDC to MidPayClient");

      // Approve USDC spending
      const approveTx = await usdc.approve(this.deployedContracts[networkName].midPay!, ethers.MaxUint256);
      await approveTx.wait();
      console.log("✅ Approved unlimited USDC spending for MidPayClient");

      // Fund with ETH
      const fundTx = await this.deployer.sendTransaction({
        to: this.deployedContracts[networkName].midPay!,
        value: ethers.parseEther("0.01")
      });
      await fundTx.wait();
      console.log("💰 Funded MidPay with 0.01 ETH");
    }

    // Deploy ExternalRouter for networks without native LayerZero
    if (!networkConfig.layerZeroEndpoint && !this.deployedContracts[networkName].externalRouter) {
      console.log("📄 Deploying ExternalRouter...");
      const ExternalRouter = await ethers.getContractFactory("ExternalRouter");
      const externalRouter = await ExternalRouter.deploy(
        this.deployedContracts[networkName].midPay!,
        networkConfig.externalRouterChainId
      );
      await externalRouter.waitForDeployment();

      this.deployedContracts[networkName].externalRouter = await externalRouter.getAddress();
      console.log("✅ ExternalRouter deployed:", this.deployedContracts[networkName].externalRouter);

      // Set LayerZero endpoint on MidPayClient
      const midPay = await ethers.getContractAt("MidPayClient", this.deployedContracts[networkName].midPay!);
      const setEndpointTx = await midPay.setLayerZeroEndpoint(this.deployedContracts[networkName].externalRouter!);
      await setEndpointTx.wait();
      console.log("✅ Set ExternalRouter as LayerZero endpoint on MidPayClient");
    }
  }

  async setupTrustedRemotes() {
    console.log("\n🔗 Setting up trusted remote connections...");

    // Setup on Optimism (Core)
    console.log("🔗 Setting up trusted remotes on Optimism Core...");
    const midPayCore = await ethers.getContractAt(
      "MidPayCore", 
      this.deployedContracts["optimism-sepolia"].midPayCore!
    );

    for (const [networkName, networkConfig] of Object.entries(NETWORKS)) {
      if (networkName === "optimism-sepolia") continue;
      
      const clientAddress = this.deployedContracts[networkName]?.midPay;
      if (!clientAddress) {
        console.log(`⚠️  Skipping ${networkName} - not deployed yet`);
        continue;
      }

      const remoteAndLocal = ethers.solidityPacked(
        ["address", "address"],
        [clientAddress, this.deployedContracts["optimism-sepolia"].midPayCore!]
      );

      try {
        const tx = await midPayCore.setTrustedRemoteLookup(networkConfig.externalRouterChainId, remoteAndLocal);
        await tx.wait();
        console.log(`✅ Set trusted remote for ${networkName} (${networkConfig.externalRouterChainId})`);
      } catch (error) {
        console.log(`❌ Failed to set trusted remote for ${networkName}:`, error);
      }
    }
  }

  async setupClientTrustedRemotes(networkName: string) {
    if (networkName === "optimism-sepolia") return;

    console.log(`🔗 Setting up trusted remote on ${networkName}...`);
    const midPay = await ethers.getContractAt("MidPayClient", this.deployedContracts[networkName].midPay!);

    const remoteAndLocal = ethers.solidityPacked(
      ["address", "address"],
      [this.deployedContracts["optimism-sepolia"].midPayCore!, this.deployedContracts[networkName].midPay!]
    );

    try {
      const tx = await midPay.setTrustedRemoteLookup(NETWORKS["optimism-sepolia"].externalRouterChainId, remoteAndLocal);
      await tx.wait();
      console.log(`✅ Set trusted remote for Optimism on ${networkName}`);
    } catch (error) {
      console.log(`❌ Failed to set trusted remote on ${networkName}:`, error);
    }
  }

  // New method to verify configuration
  async verifyConfiguration() {
    console.log("\n🔍 Verifying deployment configuration...");
    
    for (const [networkName, contracts] of Object.entries(this.deployedContracts)) {
      if (!contracts.midPay && !contracts.midPayCore) continue;
      
      console.log(`\n📋 ${networkName.toUpperCase()}:`);
      
      try {
        if (contracts.midPayCore) {
          // Verify MidPayCore configuration
          const midPayCore = await ethers.getContractAt("MidPayCore", contracts.midPayCore);
          const usdc = await midPayCore.usdc();
          const endpoint = await midPayCore.layerZeroEndpoint();
          const router = await midPayCore.externalRouter();
          
          console.log(`  USDC: ${usdc}`);
          console.log(`  LayerZero Endpoint: ${endpoint}`);
          console.log(`  External Router: ${router}`);
        }
        
        if (contracts.midPay) {
          // Verify MidPayClient configuration  
          const midPayClient = await ethers.getContractAt("MidPayClient", contracts.midPay);
          const usdc = await midPayClient.usdc();
          const endpoint = await midPayClient.layerZeroEndpoint();
          const coreAddress = await midPayClient.coreAddress();
          const coreChainId = await midPayClient.coreChainId();
          
          console.log(`  USDC: ${usdc}`);
          console.log(`  LayerZero Endpoint: ${endpoint}`);
          console.log(`  Core Address: ${coreAddress}`);
          console.log(`  Core Chain ID: ${coreChainId}`);
        }
      } catch (error) {
        console.log(`  ❌ Error verifying ${networkName}:`, error);
      }
    }
  }

  printDeploymentSummary() {
    console.log("\n📋 Deployment Summary:");
    console.log("==========================================");
    
    for (const [network, contracts] of Object.entries(this.deployedContracts)) {
      console.log(`\n🌐 ${network.toUpperCase()}:`);
      if (contracts.usdc) console.log(`  💰 FakeUSDC: ${contracts.usdc}`);
      if (contracts.midPayCore) console.log(`  🏛️  MidPayCore: ${contracts.midPayCore}`);
      if (contracts.midPay) console.log(`  📱 MidPayClient: ${contracts.midPay}`);
      if (contracts.externalRouter) console.log(`  🔀 ExternalRouter: ${contracts.externalRouter}`);
    }
    
    console.log("\n🆔 Chain ID Mapping:");
    for (const [network, config] of Object.entries(NETWORKS)) {
      console.log(`  ${network}: ${config.externalRouterChainId}`);
    }
    
    console.log("\n==========================================");
  }
}

// Main deployment function
async function main() {
  const deployer = new MidPayDeployer();
  
  const networkName = process.env.HARDHAT_NETWORK;
  if (!networkName) {
    console.log("❌ Please specify a network using --network flag");
    process.exit(1);
  }

  if (!NETWORKS[networkName as keyof typeof NETWORKS]) {
    console.log(`❌ Network ${networkName} is not supported`);
    console.log("Supported networks:", Object.keys(NETWORKS));
    process.exit(1);
  }

  try {
    // Deploy to the specified network
    await deployer.deployToNetwork(networkName);
    
    // Setup trusted remotes for client networks
    if (networkName !== "optimism-sepolia") {
      await deployer.setupClientTrustedRemotes(networkName);
    }
    
    // Verify configuration
    await deployer.verifyConfiguration();
    
    deployer.printDeploymentSummary();
    
    console.log(`\n✅ Deployment to ${networkName} completed successfully!`);
    
    if (networkName === "optimism-sepolia") {
      console.log("\n💡 Next steps:");
      console.log("1. Deploy to other networks: eth-sepolia, zora-sepolia, base-sepolia, worldchain-sepolia, ink-sepolia, unichain-sepolia, polygon-amoy");
      console.log("2. Run the setup-remotes script to configure cross-chain connections");
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { MidPayDeployer };