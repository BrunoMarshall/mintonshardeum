# MintonShardeum Token Minter

## Overview
MintonShardeum is a decentralized application (dApp) for minting ERC-20 tokens on the Shardeum blockchain. Powered by Minton, the token forger, this website allows users to create tokens with customizable parameters, connect via MetaMask, and deploy on Shardeum Testnet (with plans for Mainnet).

Website: [www.mintonshardeum.com](https://www.mintonshardeum.com)

## Features
- **Token Creation**: Create ERC-20 tokens with customizable name, symbol, initial supply, max supply, decimals, and mintability.
- **MetaMask Integration**: Connect to Shardeum Testnet or Mainnet via MetaMask.
- **Minting Fee**: 10 SHM per mint, with 0.1% of minted tokens sent to `0x0eE1b98198E400d8Da9E5431F477C0A1A2269505`.
- **Security**: Input validation to prevent SQL injection and XSS attacks.
- **Design**: Clean, futuristic UI with Orbitron font, centered input form, and social links in the footer.
- **Pages**: Home (token minter), About (project details and documentation).

## Project Structure

mintonshardeum/
├── docs/
│   ├── index.html           # Home page with token minter
│   ├── about.html           # About page with project details
│   ├── assets/
│   │   ├── css/
│   │   │   ├── styles.css   # styling
│   │   ├── js/
│   │   │   ├── app.js       # Web3.js integration
│   │   │   ├── web3.min.js  # Web3.js library
│   │   ├── images/          # Logos, favicon, and social icons
├── contracts/
│   ├── MintonToken.sol      # ERC-20 smart contract
├── README.md                # Project documentation



## Setup Instructions
 **Clone the Repository**:
   ```bash
   git clone https://github.com/BrunoMarshall/mintonshardeum.git
   cd mintonshardeum

Network DetailsTestnet:Network Name: Shardeum Testnet
RPC URL: https://api-testnet.shardeum.org
Chain ID: 8083
Block Explorer: https://explorer-testnet.shardeum.org

Mainnet:Network Name: Shardeum
RPC URL: https://api.shardeum.org
Chain ID: 8118
Block Explorer: https://explorer.shardeum.org


## Deployed contract is audited for basic security (required further audits for Mainnet!!).


## Future UpdatesTransition to Shardeum Mainnet.
Add advanced token features (e.g., burn, pause).
Enhance UI with animations and Minton character visuals.


