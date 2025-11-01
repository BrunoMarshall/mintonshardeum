# Changelog

All notable changes to the Minton project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2024-11-01

### 🚀 Major Release - Mainnet Support

This release adds full Mainnet support with network switching capabilities.

### Added
- **Mainnet Support**: Deploy tokens on Shardeum Mainnet (Chain ID: 8118)
- **Network Toggle**: Switch between Testnet and Mainnet with visual indicators
- **Visual Network Themes**:
  - Purple gradient theme for Testnet
  - Green gradient theme for Mainnet
- **Network-Specific UI**: Background colors and indicators change based on network
- **Auto Network Detection**: Automatically detects and displays current network
- **MetaMask Auto-Switch**: Prompts user to switch to selected network
- **Enhanced Network Styles**: New CSS file for network-specific styling
- **Mainnet Factory Contract**: Deployed at `0x294665ec45ab8668d922474f63a03e33416d8deb`

### Changed
- **app.js**: Refactored to support multiple networks with configuration objects
- **index.html**: Added network toggle switch component
- **UI/UX**: Enhanced with network-aware color schemes
- **Form Validation**: Improved with network-specific messages
- **Status Messages**: Color-coded by network (purple for testnet, green for mainnet)

### Improved
- Better error handling for network mismatches
- Clearer user feedback during network operations
- Enhanced mobile responsiveness for toggle switch
- More intuitive network selection process

### Security
- All security features maintained from v1.0.0
- Additional validation for network-specific operations
- Safe network switching with user confirmation

### Contract Addresses
- **Testnet Factory**: `0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4`
- **Mainnet Factory**: `0x294665ec45ab8668d922474f63a03e33416d8deb`

---

## [1.0.0] - 2024-10-15

### 🎉 Initial Release - Testnet Launch

First public release of Minton token factory on Shardeum Testnet.

### Added
- **ERC-20 Token Factory**: Deploy custom ERC-20 tokens
- **Smart Contracts**:
  - MintonToken.sol: Individual token implementation
  - MintonTokenFactory.sol: Factory for deploying tokens
- **Web Interface**: User-friendly dApp for token deployment
- **MetaMask Integration**: Seamless wallet connection
- **Token Customization**:
  - Custom name and symbol
  - Configurable initial supply
  - Maximum supply cap
  - Optional mintability
- **Security Features**:
  - ReentrancyGuard protection
  - Pausable functionality
  - Ownable access control
  - Input validation
- **Fee System**: 5,000 SHM deployment fee
- **Token Tracking**: List of all deployed tokens
- **Block Explorer Integration**: Direct links to transactions
- **Responsive Design**: Mobile-friendly interface

### Contract Features
- **MintonToken**:
  - ERC-20 standard compliance (OpenZeppelin)
  - Owner-controlled minting
  - Max supply enforcement
  - Configurable mintability
- **MintonTokenFactory**:
  - Deploy new token instances
  - Collect deployment fees
  - Track deployed tokens
  - Emergency pause mechanism
  - Fee management

### Security
- OpenZeppelin v5.0.0 dependencies
- Solidity 0.8.30
- Comprehensive access controls
- Reentrancy protection
- Zero address checks

### Initial Deployment
- **Network**: Shardeum Testnet (Chain ID: 8119)
- **Factory Address**: `0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4`
- **Fee Collector**: `0x0eE1b98198E400d8Da9E5431F477C0A1A2269505`

---

## [Unreleased]

### Planned Features

#### Phase 3 (Q1 2025)
- [ ] Token analytics dashboard
- [ ] Advanced token templates
- [ ] Token verification system
- [ ] Enhanced token browser

#### Phase 4 (Q2 2025)
- [ ] Multi-chain support (Ethereum, Polygon, BSC)
- [ ] Liquidity pool integration
- [ ] Token governance features
- [ ] Mobile application

#### Future Considerations
- [ ] Token locking mechanisms
- [ ] Vesting schedules
- [ ] Multi-sig support
- [ ] DAO integration
- [ ] NFT support
- [ ] Cross-chain bridges

---

## Version History

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Schedule

- **Major releases**: Quarterly
- **Minor releases**: Monthly
- **Patch releases**: As needed

---

## Migration Guides

### Migrating from 1.0.0 to 2.0.0

#### For Users
No migration needed! Your existing tokens work exactly the same.

#### For Developers

**JavaScript/Frontend:**
```javascript
// Old (v1.0.0)
const factoryAddress = "0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4";
const factory = new web3.eth.Contract(factoryABI, factoryAddress);

// New (v2.0.0)
const NETWORKS = {
  TESTNET: {
    factoryAddress: '0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4',
    chainId: 8119
  },
  MAINNET: {
    factoryAddress: '0x294665ec45ab8668d922474f63a03e33416d8deb',
    chainId: 8118
  }
};

const currentNetwork = 'TESTNET'; // or 'MAINNET'
const factory = new web3.eth.Contract(
  factoryABI, 
  NETWORKS[currentNetwork].factoryAddress
);
```

**HTML/CSS:**
```html
<!-- Add network toggle -->
<div class="network-toggle-container">
  <div id="network-indicator" class="network-indicator testnet">
    🔧 TESTNET MODE
  </div>
  <label class="network-switch">
    <input type="checkbox" id="network-toggle">
    <span class="slider"></span>
  </label>
</div>

<!-- Include new stylesheet -->
<link rel="stylesheet" href="assets/css/network-styles.css">
```

---

## Breaking Changes

### Version 2.0.0
- No breaking changes for end users
- Frontend code structure changed (see migration guide above)
- Contract interfaces unchanged

---

## Deprecations

### None Currently

We'll announce deprecations at least 3 months in advance.

---

## Known Issues

### Version 2.0.0
- Sourcify verification not available for Shardeum (doesn't affect functionality)
- Some mobile wallets may have connection issues
- Gas estimation may be high on first mainnet deployment

### Version 1.0.0
- None reported

---

## Security Updates

### Version 2.0.0
- No security issues found
- All dependencies up to date
- Contracts unchanged from audited v1.0.0

### Version 1.0.0
- Initial security audit passed
- OpenZeppelin contracts used for security

---

## Performance Improvements

### Version 2.0.0
- Faster network switching
- Improved UI responsiveness
- Optimized CSS loading

### Version 1.0.0
- Initial optimizations implemented
- Gas-efficient contract design

---

## Contributors

### Version 2.0.0
- [@BrunoMarshall](https://github.com/BrunoMarshall) - Lead Developer

### Version 1.0.0
- [@BrunoMarshall](https://github.com/BrunoMarshall) - Creator & Lead Developer

---

## Support

### Getting Help
- 📖 [Documentation](https://github.com/BrunoMarshall/mintonshardeum)
- 💬 [Discord Community](#)
- 🐦 [Twitter Updates](#)
- 📧 Email: support@mintonshardeum.com

### Reporting Issues
- 🐛 [Bug Reports](https://github.com/BrunoMarshall/mintonshardeum/issues)
- 💡 [Feature Requests](https://github.com/BrunoMarshall/mintonshardeum/issues)

---

## Links

- **Website**: https://mintonshardeum.com
- **GitHub**: https://github.com/BrunoMarshall/mintonshardeum
- **Testnet Explorer**: https://explorer-mezame.shardeum.org
- **Mainnet Explorer**: https://explorer.shardeum.org

---

*This changelog is maintained following [Keep a Changelog](https://keepachangelog.com/) conventions.*

Last Updated: November 1, 2024
