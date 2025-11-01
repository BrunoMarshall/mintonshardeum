# Contributing to Minton

First off, thank you for considering contributing to Minton! It's people like you that make Minton such a great tool for the Shardeum community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this code.

### Our Pledge

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, MetaMask version)

**Template:**
```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- MetaMask Version: [e.g., 11.0.0]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**
- Clear, descriptive title
- Detailed description of the enhancement
- Why this enhancement would be useful
- Possible implementation approach

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

---

## 💻 Development Setup

### Prerequisites

- Node.js (v16 or higher)
- Git
- MetaMask browser extension
- Code editor (VS Code recommended)

### Setup Steps

1. **Fork the repository**
   ```bash
   # Click 'Fork' on GitHub, then:
   git clone https://github.com/YOUR-USERNAME/mintonshardeum.git
   cd mintonshardeum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Edit files in `docs/` for frontend
   - Edit files in `contracts/` for smart contracts

5. **Test your changes**
   ```bash
   # Run local server
   cd docs
   python -m http.server 8000
   # Test in browser at http://localhost:8000
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Description of your changes"
   git push origin feature/your-feature-name
   ```

### Testing Smart Contracts

1. Open [Remix IDE](https://remix.ethereum.org)
2. Upload your modified contracts
3. Compile with Solidity 0.8.30
4. Deploy to Shardeum Testnet
5. Test all functions thoroughly
6. Document any changes to gas costs

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass (if applicable)
- [ ] Screenshots added (for UI changes)

### Submission Steps

1. **Update documentation**
   - Update README.md if needed
   - Add inline code comments
   - Update CHANGELOG.md

2. **Create Pull Request**
   - Use clear, descriptive title
   - Reference related issues
   - Provide detailed description
   - Add screenshots/videos if applicable

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Related Issues
   Fixes #(issue number)
   
   ## How Has This Been Tested?
   Describe testing approach
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No new warnings
   - [ ] Tests pass
   ```

4. **Respond to feedback**
   - Address review comments
   - Push updates to your branch
   - Request re-review when ready

---

## 📝 Style Guidelines

### Git Commit Messages

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(factory): Add batch deployment functionality
fix(ui): Resolve network toggle bug on mobile
docs(readme): Update installation instructions
style(css): Format network-styles.css
refactor(app): Simplify contract interaction logic
```

### JavaScript Style

- Use ES6+ features
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Descriptive variable names

```javascript
// Good
const factoryAddress = '0x1234...';
const deployToken = async (params) => {
  try {
    const result = await contract.methods.deployToken(...params).send();
    return result;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
};

// Avoid
var addr = "0x1234..."
function deploy(p) {
  return contract.methods.deployToken(...p).send()
}
```

### Solidity Style

Follow official [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)

```solidity
// Good
contract MintonToken is ERC20, Ownable {
    uint256 public maxSupply;
    bool public mintable;
    
    event TokenMinted(address indexed to, uint256 amount);
    
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply
    ) ERC20(tokenName, tokenSymbol) {
        maxSupply = initialSupply;
    }
}

// Use descriptive names
// Add comments for complex logic
// Follow ordering: state vars, events, constructor, functions
```

### HTML/CSS Style

- Semantic HTML5 elements
- BEM naming convention for CSS
- Mobile-first approach
- Accessibility considerations

```html
<!-- Good -->
<section class="deploy-section">
  <div class="deploy-section__container">
    <h2 class="deploy-section__title">Deploy Your Token</h2>
    <form class="deploy-section__form" id="token-form">
      <!-- form content -->
    </form>
  </div>
</section>
```

```css
/* Good */
.deploy-section {
  padding: 2rem;
  background: var(--bg-primary);
}

.deploy-section__container {
  max-width: 1200px;
  margin: 0 auto;
}

.deploy-section__title {
  font-size: 2rem;
  margin-bottom: 1rem;
}
```

### Documentation Style

- Use Markdown for documentation
- Include code examples
- Add screenshots for UI features
- Keep language clear and concise

---

## 🧪 Testing Guidelines

### Smart Contract Testing

1. **Unit Tests**
   - Test individual functions
   - Test edge cases
   - Test failure scenarios

2. **Integration Tests**
   - Test contract interactions
   - Test with real tokens
   - Test on testnet first

3. **Gas Optimization**
   - Measure gas usage
   - Optimize where possible
   - Document gas costs

### Frontend Testing

1. **Manual Testing**
   - Test on multiple browsers
   - Test on mobile devices
   - Test with different wallets

2. **User Flows**
   - Complete token deployment
   - Network switching
   - Error handling
   - Edge cases

---

## 📚 Areas for Contribution

### High Priority

- [ ] Token analytics dashboard
- [ ] Advanced token templates
- [ ] Mobile app development
- [ ] Multi-language support

### Medium Priority

- [ ] Token verification system
- [ ] Liquidity pool integration
- [ ] Enhanced token browser
- [ ] Governance features

### Documentation

- [ ] Video tutorials
- [ ] API documentation
- [ ] User guides
- [ ] Developer docs

### Nice to Have

- [ ] Dark mode toggle
- [ ] Token import/export
- [ ] Batch operations
- [ ] Custom themes

---

## 🌍 Community

### Get in Touch

- **Discord**: Join our community
- **Twitter**: Follow for updates
- **GitHub Discussions**: Ask questions
- **Email**: dev@mintonshardeum.com

### Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Featured on website (for major contributions)
- Eligible for bounties (future)

---

## 🎁 Bounties and Rewards

We're working on establishing a bounty program for:
- Critical bug fixes
- Major feature additions
- Security improvements
- Documentation enhancements

Stay tuned for updates!

---

## 📖 Resources

### Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Shardeum Docs](https://docs.shardeum.org/)

### Development Tools

- [Remix IDE](https://remix.ethereum.org/)
- [Hardhat](https://hardhat.org/)
- [Truffle](https://trufflesuite.com/)
- [MetaMask](https://metamask.io/)

---

## ❓ Questions?

Don't hesitate to ask! There are no stupid questions.

- Open an issue with the `question` label
- Ask in GitHub Discussions
- Reach out on Discord
- Email the maintainers

---

## 🙏 Thank You!

Your contributions make Minton better for everyone. We appreciate your time and effort!

**Happy Coding! 🚀**

---

*This contributing guide is adapted from open source contributing guides. Feel free to suggest improvements!*
