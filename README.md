# 🚀 Minton - ERC-20 Token Factory for Shardeum

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Latest-brightgreen)](https://openzeppelin.com/)

**Minton** is a secure, user-friendly platform for deploying custom ERC-20 tokens on the Shardeum blockchain. No coding required - just fill in your token details and deploy in minutes!

🌐 **Live Demo**: [https://mintonshardeum.com](https://mintonshardeum.com)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Architecture](#-architecture)
- [Smart Contracts](#-smart-contracts)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Usage](#-usage)
- [Security](#-security)
- [Contract Addresses](#-contract-addresses)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **One-Click Token Deployment** - Deploy ERC-20 tokens in under 2 minutes
- **Multi-Network Support** - Test on Testnet, deploy to Mainnet
- **Network Toggle** - Switch between networks with visual indicators
- **Full ERC-20 Compliance** - Industry-standard token implementation
- **Customizable Parameters** - Control supply, minting, and more

### 🔐 Security Features
- **OpenZeppelin Standards** - Battle-tested smart contract libraries
- **Reentrancy Protection** - Guards against common attacks
- **Pausable Contracts** - Emergency stop mechanism
- **Owner Controls** - Granular access management
- **Input Validation** - Prevents malicious inputs

### 🎨 User Experience
- **Visual Network Indicators** - Purple for Testnet, Green for Mainnet
- **MetaMask Integration** - Seamless wallet connection
- **Real-time Feedback** - Transaction status updates
- **Mobile Responsive** - Works on all devices
- **Block Explorer Links** - Easy transaction verification

---

## 🎬 Demo

### Network Toggle
Switch between Testnet and Mainnet with a single click. The entire UI adapts with color themes:
- 🟣 **Purple Theme** = Testnet (Chain ID: 8119)
- 🟢 **Green Theme** = Mainnet (Chain ID: 8118)

### Token Deployment Flow
1. Connect MetaMask wallet
2. Choose network (Testnet or Mainnet)
3. Fill in token details (name, symbol, supply)
4. Pay deployment fee (5,000 SHM)
5. Receive your deployed token address
6. Start using your token!

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Minton Platform                        │
│                  (Web3 Frontend + dApp)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
    ┌──────▼──────┐          ┌──────▼──────┐
    │   TESTNET   │          │   MAINNET   │
    │ Chain: 8119 │          │ Chain: 8118 │
    └──────┬──────┘          └──────┬──────┘
           │                         │
    ┌──────▼──────┐          ┌──────▼──────┐
    │   Factory   │          │   Factory   │
    │  Contract   │          │  Contract   │
    └──────┬──────┘          └──────┬──────┘
           │                         │
    ┌──────▼──────┐          ┌──────▼──────┐
    │   Deployed  │          │   Deployed  │
    │    Tokens   │          │    Tokens   │
    └─────────────┘          └─────────────┘
```

### Smart Contract Architecture

```
┌────────────────────────────────────────────┐
│      MintonTokenFactory.sol                │
│  (Factory Pattern - Deploys New Tokens)   │
│                                            │
│  Security:                                 │
│  • ReentrancyGuard                         │
│  • Pausable                                │
│  • Ownable                                 │
│                                            │
│  Main Functions:                           │
│  • deployToken()                           │
│  • pause() / unpause()                     │
│  • setFeeCollector()                       │
│  • setDeploymentFee()                      │
│  • getDeployedTokens()                     │
└────────────┬───────────────────────────────┘
             │
             │ Creates Instance ▼
             │
┌────────────▼───────────────────────────────┐
│         MintonToken.sol                    │
│    (ERC-20 Token Implementation)          │
│                                            │
│  Inherits:                                 │
│  • ERC20 (OpenZeppelin)                    │
│  • Ownable                                 │
│                                            │
│  Features:                                 │
│  • Configurable max supply                 │
│  • Optional mintability                    │
│  • Owner-controlled minting                │
│  • Standard ERC-20 functions               │
└────────────────────────────────────────────┘
```

### Frontend Architecture

```
docs/
├── index.html              # Main landing page
├── tokens.html             # Token browser
├── about.html              # About page
├── submit-token.html       # Token submission
│
└── assets/
    ├── css/
    │   ├── styles.css              # Main styles
    │   └── network-styles.css      # Network themes
    │
    ├── js/
    │   ├── app.js                  # Main application
    │   ├── tokens.js               # Token browser logic
    │   ├── token-submission-simple.js
    │   └── web3_min.js             # Web3 library
    │
    ├── images/
    │   ├── logo.png
    │   └── favicon.png
    │
    └── abis/
        └── MintonTokenFactory.json # Contract ABI
```

---

## 📜 Smart Contracts

### MintonTokenFactory.sol

The factory contract that deploys new token instances.

**Key Features:**
- Deploys new MintonToken contracts
- Collects deployment fees (5,000 SHM)
- Tracks all deployed tokens
- Emergency pause functionality
- Owner-controlled fee management

**Main Functions:**
```solidity
function deployToken(
    string memory tokenName,
    string memory tokenSymbol,
    uint256 initialSupply,
    uint256 maxSupply,
    bool mintable
) public payable

function pause() public onlyOwner
function unpause() public onlyOwner
function setFeeCollector(address _feeCollector) public onlyOwner
function setDeploymentFee(uint256 _newFee) public onlyOwner
function getDeployedTokens() public view returns (address[] memory)
```

### MintonToken.sol

Individual ERC-20 token contract.

**Key Features:**
- Full ERC-20 standard compliance
- Configurable maximum supply
- Optional minting capability
- Owner-only mint function
- Supply cap enforcement

**Main Functions:**
```solidity
function mint(address to, uint256 amount) public onlyOwner
function setMintable(bool _mintable) public onlyOwner

// Standard ERC-20 functions
function transfer(address to, uint256 amount) public returns (bool)
function approve(address spender, uint256 amount) public returns (bool)
function transferFrom(address from, address to, uint256 amount) public returns (bool)
```

---

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity**: 0.8.30
- **OpenZeppelin**: Latest (ERC-20, Ownable, ReentrancyGuard, Pausable)
- **Remix IDE**: Development and deployment

### Frontend
- **HTML5/CSS3**: Responsive design
- **JavaScript**: ES6+
- **Web3.js**: Blockchain interaction
- **MetaMask**: Wallet integration

### Blockchain
- **Shardeum Testnet**: Chain ID 8119
- **Shardeum Mainnet**: Chain ID 8118
- **EVM Compatible**: Full Ethereum compatibility

### Deployment
- **GitHub Pages**: Frontend hosting
- **Git**: Version control

---

## 🚀 Getting Started

### Prerequisites

- [MetaMask](https://metamask.io/) browser extension
- SHM tokens for deployment (5,000 SHM + gas fees)
- Basic understanding of ERC-20 tokens

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/BrunoMarshall/mintonshardeum.git
cd mintonshardeum
```

2. **Configure MetaMask**

Add Shardeum networks to MetaMask:

**Testnet:**
```
Network Name: Shardeum EVM Testnet
RPC URL: https://api-mezame.shardeum.org/
Chain ID: 8119
Currency Symbol: SHM
Block Explorer: https://explorer-mezame.shardeum.org/
```

**Mainnet:**
```
Network Name: Shardeum
RPC URL: https://api.shardeum.org/
Chain ID: 8118
Currency Symbol: SHM
Block Explorer: https://explorer.shardeum.org/
```

3. **Run locally**
```bash
cd docs
python -m http.server 8000
# OR
npx http-server -p 8000
```

4. **Open in browser**
```
http://localhost:8000
```

---

## 🚢 Deployment

### Smart Contract Deployment

1. **Open Remix IDE**
   - Go to [https://remix.ethereum.org](https://remix.ethereum.org)

2. **Upload Contracts**
   - Upload `contracts/MintonToken.sol`
   - Upload `contracts/MintonTokenFactory.sol`

3. **Compile**
   - Solidity version: 0.8.30
   - Enable optimization: 200 runs

4. **Deploy**
   - Select "Injected Provider - MetaMask"
   - Select "MintonTokenFactory" contract
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Save deployed contract address

### Frontend Deployment

The frontend is automatically deployed via GitHub Pages from the `docs/` folder.

1. **Update contract addresses**
   - Edit `docs/assets/js/app.js`
   - Update factory addresses for both networks

2. **Commit and push**
```bash
git add .
git commit -m "Update contract addresses"
git push origin main
```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/docs`
   - Save

4. **Access your site**
   - Your site will be live at: `https://yourusername.github.io/mintonshardeum`

---

## 💡 Usage

### Deploying a Token

1. **Connect Wallet**
   - Click "Connect MetaMask"
   - Approve connection

2. **Select Network**
   - Use toggle switch to choose Testnet or Mainnet
   - MetaMask will prompt to switch networks

3. **Fill Token Details**
   - Token Name (max 50 characters)
   - Token Symbol (max 10 characters)
   - Initial Supply (in tokens, not wei)
   - Maximum Supply (must be ≥ initial supply)
   - Mintable (optional, allows future minting)

4. **Deploy**
   - Click "Deploy Token"
   - Confirm transaction (5,000 SHM + gas)
   - Wait for confirmation
   - Receive token contract address

5. **Use Your Token**
   - Add to MetaMask
   - Transfer to others
   - Use in DeFi protocols
   - Mint more (if mintable)

### Managing Your Token

After deployment, you can:
- Mint additional tokens (if mintable)
- Toggle mintability on/off
- Transfer ownership
- Use standard ERC-20 functions

---

## 🔐 Security

### Audited Features

✅ **ReentrancyGuard**: Prevents reentrancy attacks  
✅ **Ownable**: Secure ownership management  
✅ **Pausable**: Emergency stop mechanism  
✅ **Input Validation**: Prevents malicious inputs  
✅ **Zero Address Checks**: Prevents token loss  
✅ **Supply Cap Enforcement**: Prevents over-minting  

### Security Best Practices

- Uses OpenZeppelin's audited contracts
- No hidden mint functions
- No backdoors or admin keys (beyond standard ownership)
- Transparent fee structure
- Immutable core functionality
- User is owner of deployed token

### Known Limitations

- Factory owner can pause deployments
- Factory owner can change deployment fee
- Factory owner can change fee collector address
- User tokens are independent once deployed

### Responsible Disclosure

Found a security issue? Please email: [your-email@example.com]

---

## 📍 Contract Addresses

### Shardeum Testnet (Chain ID: 8119)

- **Factory**: `0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4`
- **Explorer**: [View on Explorer](https://explorer-mezame.shardeum.org/address/0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4)

### Shardeum Mainnet (Chain ID: 8118)

- **Factory**: `0x294665ec45ab8668d922474f63a03e33416d8deb`
- **Explorer**: [View on Explorer](https://explorer.shardeum.org/address/0x294665ec45ab8668d922474f63a03e33416d8deb)

### Fee Collector

- **Address**: `0x0eE1b98198E400d8Da9E5431F477C0A1A2269505`
- **Purpose**: Receives deployment fees for platform maintenance

---

## 💰 Economics

### Deployment Fee

- **Amount**: 5,000 SHM per token deployment
- **Use**: Platform maintenance and development
- **Refund**: Excess payment automatically refunded

### Gas Fees

- Paid separately to network validators
- Varies based on network congestion
- Typically 2-3 SHM for deployment

---

## 🎨 UI/UX Features

### Network Themes

**Testnet Mode** (🟣 Purple)
- Purple gradient background
- Testing-focused messaging
- Clear "Testnet" indicators
- Free test tokens available

**Mainnet Mode** (🟢 Green)
- Green gradient background
- Production-focused messaging
- Clear "Mainnet" indicators
- Real value warnings

### Responsive Design

- Desktop optimized
- Tablet compatible
- Mobile friendly
- Touch-optimized controls

---

## 📊 Statistics

View platform statistics:
- Total tokens deployed
- Active tokens
- Network distribution
- Popular token configurations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow Solidity style guide
- Write clear commit messages
- Add tests for new features
- Update documentation
- Ensure code passes linting

---

## 🗺️ Roadmap

### Phase 1 (✅ Completed)
- [x] ERC-20 token factory
- [x] Testnet deployment
- [x] Basic web interface
- [x] MetaMask integration

### Phase 2 (✅ Completed)
- [x] Mainnet deployment
- [x] Network toggle feature
- [x] Visual network indicators
- [x] Enhanced UI/UX

### Phase 3 (🚧 In Progress)
- [ ] Token browser/explorer
- [ ] Token analytics dashboard
- [ ] Advanced token templates
- [ ] Token verification system

### Phase 4 (📅 Planned)
- [ ] Multi-chain support
- [ ] Liquidity pool integration
- [ ] Token governance features
- [ ] Mobile app

---

## 📖 Documentation

### For Users
- [User Guide](docs/USER_GUIDE.md)
- [FAQ](docs/FAQ.md)
- [Video Tutorials](docs/TUTORIALS.md)

### For Developers
- [Smart Contract Documentation](docs/CONTRACTS.md)
- [API Reference](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)

---

## ❓ FAQ

**Q: How much does it cost to deploy a token?**  
A: 5,000 SHM deployment fee + network gas fees (≈2-3 SHM)

**Q: Can I mint more tokens after deployment?**  
A: Yes, if you enable "mintable" during deployment

**Q: Who owns the deployed token?**  
A: You! You become the owner of your token contract

**Q: Can I change the token supply later?**  
A: Only if mintable is enabled, and only up to max supply

**Q: Is my token ERC-20 compliant?**  
A: Yes! Fully compatible with all ERC-20 standards

**Q: Can I use my token on other platforms?**  
A: Yes! Your token works on any EVM-compatible platform

---

## 🐛 Known Issues

- Sourcify verification not available for Shardeum yet (contract works fine)
- Some mobile wallets may have connection issues
- Gas estimation might be high on first deployment

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [Shardeum](https://shardeum.org/) - Blockchain platform
- [Web3.js](https://web3js.org/) - Ethereum JavaScript API
- [MetaMask](https://metamask.io/) - Wallet provider

---

## 📞 Support

### Get Help
- **Discord**: [Join our community](#)
- **Twitter**: [@MintonShardeum](#)
- **Email**: support@mintonshardeum.com
- **Documentation**: [Read the docs](#)

### Report Issues
- [GitHub Issues](https://github.com/BrunoMarshall/mintonshardeum/issues)
- [Bug Bounty Program](#)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=BrunoMarshall/mintonshardeum&type=Date)](https://star-history.com/#BrunoMarshall/mintonshardeum&Date)

---

## 📈 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

<div align="center">

**Built with ❤️ for the Shardeum Community**

[Website](https://mintonshardeum.com) · [Documentation](#) · [Report Bug](https://github.com/BrunoMarshall/mintonshardeum/issues) · [Request Feature](https://github.com/BrunoMarshall/mintonshardeum/issues)

**Made with** ☕ **and** 🎵 **by [Bruno Marshall](https://github.com/BrunoMarshall)**

---

**⭐ If you find this project useful, please consider giving it a star! ⭐**

</div>
