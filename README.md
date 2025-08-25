# MidPay Deployment Guide - Hardhat Ignition v3

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
ETH_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
OP_SEPOLIA_RPC=https://sepolia.optimism.io
MODE_SEPOLIA_RPC=https://sepolia.mode.network
ZORA_SEPOLIA_RPC=https://sepolia.rpc.zora.energy

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_key
OPTIMISM_API_KEY=your_optimism_key
MODE_API_KEY=your_mode_key
ZORA_API_KEY=your_zora_key
```

### 3. Deploy All Contracts
```bash
npm run deploy:all
```

### 4. Update Core Addresses on Clients
```bash
npm run update-core-address
```

### 5. Configure Trusted Remotes
```bash
npm run configure:all
```

## 📋 Step-by-Step Deployment

### Step 1: Deploy Core Network (Optimism Sepolia)
```bash
npm run deploy:core
```
This deploys:
- ✅ FakeUSDC
- ✅ MidPayCore
- ✅ ExternalRouter

### Step 2: Deploy Client Networks
```bash
npm run deploy:eth    # Ethereum Sepolia
npm run deploy:mode   # Mode Sepolia  
npm run deploy:zora   # Zora Sepolia
```
Each deploys:
- ✅ FakeUSDC
- ✅ MidPayClient

### Step 3: Update Core Addresses
```bash
npm run update-core-address
```
Updates placeholder core addresses on all client contracts.

### Step 4: Configure Cross-Chain Communication
```bash
npm run configure:all
```
Sets up trusted remotes between all contracts.

## 🗂️ File Structure

```
project/
├── contracts/
│   ├── MidPayCore.sol
│   ├── MidPayClient.sol
│   ├── util/
│   │   ├── FakeUSDC.sol
│   │   └── ExternalRouter.sol
│   └── interfaces/
│       └── IExternalRouter.sol
├── ignition/
│   ├── modules/
│   │   ├── FakeUSDC.ts
│   │   ├── MidPayCore.ts
│   │   └── MidPayClient.ts
│   └── deployments/
│       ├── chain-11155420/  # Optimism Sepolia
│       ├── chain-11155111/  # Ethereum Sepolia
│       ├── chain-919/       # Mode Sepolia
│       └── chain-999999999/ # Zora Sepolia
├── scripts/
│   ├── configure-trusted-remotes.ts
│   └── update-core-address.ts
└── package.json
```

## 📜 Available Scripts

### Deployment Scripts
- `npm run deploy:core` - Deploy to Optimism Sepolia (core)
- `npm run deploy:eth` - Deploy to Ethereum Sepolia (client)
- `npm run deploy:mode` - Deploy to Mode Sepolia (client)
- `npm run deploy:zora` - Deploy to Zora Sepolia (client)
- `npm run