# 🌉 Midway - Cross-Chain Payment Infrastructure

<div align="center">

![Midway Logo](https://img.shields.io/badge/Midway-Cross--Chain%20Payments-blue?style=for-the-badge&logo=ethereum)

**Seamless cross-chain payments powered by LayerZero**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-brightgreen.svg)](https://hardhat.org/)
[![LayerZero](https://img.shields.io/badge/Powered%20by-LayerZero-purple.svg)](https://layerzero.network/)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🌐 Networks](#-supported-networks) • [🔧 Development](#-development)

</div>

---

## 🎯 What is Midway?

**Midway** is a revolutionary cross-chain payment infrastructure that enables users to deposit funds on any supported blockchain and have them instantly available on the core network. Built on LayerZero's omnichain protocol, Midway eliminates the friction of managing multiple wallets and bridging funds across different chains.

### 🔥 Key Features

- **🌍 Multi-Chain Support**: Deploy across 8+ blockchain networks
- **⚡ Instant Settlements**: LayerZero-powered cross-chain messaging
- **🔒 Secure**: Trusted remote validation and external routing
- **💰 Unified Balance**: Single balance accessible from any chain
- **🛠️ Developer Friendly**: Comprehensive tooling and debugging scripts

---

## 🚀 How Midway Solves Cross-Chain Payments

### 💸 Traditional Problems

- **Multiple Wallets**: Users need separate wallets for each chain
- **Bridge Complexity**: Manual bridging is slow and expensive  
- **Fragmented Liquidity**: Funds locked on specific chains
- **Poor UX**: Complex multi-step processes

### ✨ Midway Solution

```
User Deposits on Chain A → LayerZero Message → Core Balance Updated
User Withdraws on Chain B ← LayerZero Message ← Core Balance Verified
```

1. **Unified Core**: All balances managed on Optimism Sepolia
2. **Smart Routing**: External routers handle non-LayerZero chains
3. **Instant Messaging**: Real-time cross-chain communication
4. **Seamless UX**: Deposit anywhere, spend everywhere

---

## 🌐 Supported Networks

Midway is deployed across **8 blockchain networks**:

| Network | Type | Chain ID | External Router ID | Status |
|---------|------|----------|-------------------|--------|
| **Optimism Sepolia** | Core | 11155420 | 420 | 🟢 Live |
| **Ethereum Sepolia** | Client | 11155111 | 111 | 🟢 Live |
| **Zora Sepolia** | Client | 999999999 | 9999 | 🟢 Live |
| **Base Sepolia** | Client | 84532 | 845 | 🟢 Live |
| **Worldchain Sepolia** | Client | 4801 | 480 | 🟢 Live |
| **Ink Sepolia** | Client | 763373 | 763 | 🟢 Live |
| **Unichain Sepolia** | Client | 1301 | 130 | 🟢 Live |
| **Polygon Amoy** | Client | 80002 | 800 | 🟢 Live |

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Net A  │    │  Optimism Core  │    │   Client Net B  │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │┌─────────────────┐│    │┌─────────────┐ │
│  │ MidPayClient││◄──►││   MidPayCore    ││◄──►││ MidPayClient│ │
│  └─────────────┘│    │└─────────────────┘│    │└─────────────┘ │
│  ┌─────────────┐│    │┌─────────────────┐│    │┌─────────────┐ │
│  │ExtRouter/LZ ││    ││   LayerZero     ││    ││ExtRouter/LZ │ │
│  └─────────────┘│    │└─────────────────┘│    │└─────────────┘ │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### 📋 Prerequisites

```bash
# Node.js v18+ and npm
node --version && npm --version

# Install dependencies
npm install
```

### 🔧 Environment Setup

Create `.env` file:

```bash
# Required: Private key for deployments
PRIVATE_KEY=your_private_key_here

# Network RPC URLs (add as needed)
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
ETH_SEPOLIA_RPC_URL=https://ethereum-sepolia.blockpi.network/v1/rpc/public
ZORA_SEPOLIA_RPC_URL=https://sepolia.rpc.zora.energy
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
WORLDCHAIN_SEPOLIA_RPC_URL=https://worldchain-sepolia.g.alchemy.com/v2/YOUR_KEY
INK_SEPOLIA_RPC_URL=https://sepolia-rpc.inkonchain.com
UNICHAIN_SEPOLIA_RPC_URL=https://sepolia.unichain.org
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

### 📦 Compilation

```bash
npm run compile
```

---

## 🚀 Deployment Guide

### Step 1: Deploy Core (Optimism)

```bash
# Deploy MidPayCore on Optimism Sepolia
npm run deploy:core
```

### Step 2: Deploy Client Networks

```bash
# Deploy to all client networks
npm run deploy:eth        # Ethereum Sepolia
npm run deploy:zora       # Zora Sepolia  
npm run deploy:base       # Base Sepolia
npm run deploy:worldchain # Worldchain Sepolia
npm run deploy:ink        # Ink Sepolia
npm run deploy:unichain   # Unichain Sepolia
npm run deploy:polygon    # Polygon Amoy
```

### Step 3: Configure Trusted Remotes

```bash
# Fix and configure all trusted remote connections
npm run fix:remotes
```

### 🎉 Deployment Complete!

Your Midway infrastructure is now deployed across all networks with proper cross-chain connections configured.

---

## 🔧 Development & Debugging

### 🔍 Debugging Tools

```bash
# Check trusted remote configurations
npm run debug:remotes

# Debug cross-chain message flow
npm run debug:flow

# Check user balance on core
npm run check:balance
```

### 📊 Monitoring & Verification

#### Check Trusted Remotes
```bash
npm run debug:remotes
```
**Output:**
- ✅ Correct trusted remote configurations
- ❌ Missing or incorrect configurations
- 🔧 Expected vs actual address combinations

#### Monitor Cross-Chain Flow
```bash
npm run debug:flow
```
**Output:**
- 📬 Message queue status
- 📨 Recent cross-chain events
- 🔗 Endpoint configurations
- ❌ Connection issues

#### Verify User Balances
```bash
npm run check:balance
```
**Output:**
- 💰 User balance on core network
- 💵 USDC token information
- 📋 Formatted balance displays

---

## 📖 Documentation

### 🏗️ Contract Architecture

#### Core Contracts

- **`MidPayCore`**: Central balance management on Optimism
- **`MidPayClient`**: Client-side deposit/withdrawal handling
- **`ExternalRouter`**: Routes messages for non-LayerZero chains
- **`FakeUSDC`**: Test USDC token for development

#### Key Functions

```solidity
// Deposit funds (triggers cross-chain message)
function deposit(uint256 amount) external

// Withdraw funds (requires core balance)
function withdraw(uint256 amount) external  

// Cross-chain message handling
function lzReceive(uint16 srcChainId, bytes memory srcAddress, bytes memory payload) external
```

### 🔐 Security Features

- **Trusted Remote Validation**: Only authorized contracts can send messages
- **Address Verification**: Packed address validation for message authenticity
- **Replay Protection**: Prevents message replay attacks
- **Access Control**: Owner-only administrative functions

---

## 🛠️ Advanced Configuration

### 🔗 Adding New Networks

1. **Update `scripts/network-config.ts`**:
```typescript
"new-network": {
  chainId: 123456,
  externalRouterChainId: 123,
  layerZeroEndpoint: "0x..." // or null
}
```

2. **Add to `hardhat.config.ts`**:
```typescript
"new-network": {
  url: process.env.NEW_NETWORK_RPC_URL,
  accounts: [process.env.PRIVATE_KEY]
}
```

3. **Deploy contracts**:
```bash
npm run deploy:new-network
```

4. **Update trusted remotes**:
```bash
npm run fix:remotes
```

### 🧪 Testing

```bash
# Run all tests
npm test

# Compile contracts
npm run compile

# Clean build artifacts  
npm run clean
```

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Support

- **Documentation**: [GitHub Wiki](../../wiki)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)

---

<div align="center">

**Built with ❤️ by the Midway Team**

*Bridging the gap between blockchains, one payment at a time.*

</div>