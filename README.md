# MintonShardeum Token Minter

## Overview
MintonShardeum is a decentralized application (dApp) for minting ERC-20 tokens on the Shardeum blockchain. Powered by Minton, the token forger, this website (https://mintonshardeum.com/) allows users to create custom tokens with customizable parameters, connect via MetaMask, and deploy on Shardeum Unstablenet (with plans for Mainnet). The dApp now utilizes a `MintonTokenFactory` contract to enable users to mint new token projects directly from the website.

Website: [https://mintonshardeum.com](https://mintonshardeum.com)

## Features
- **Token Creation**: Users can deploy new ERC-20 tokens with customizable name, symbol, initial supply, max supply, decimals, and mintability.
- **MetaMask Integration**: Connect to Shardeum Unstablenet or Mainnet via MetaMask.
- **Minting Fee**: 10 SHM deployment fee per new token, with an additional 10 SHM + 0.1% fee for minting more tokens (if mintable is enabled).
- **Security**: Input validation to prevent SQL injection and XSS attacks; basic contract audit completed (further audits recommended for Mainnet).
- **Design**: Clean, futuristic UI with centered input form and social links in the footer.
- **Pages**: Home (token minter), About (project details and documentation).

## Project Structure

mintonshardeum/
├── docs/
│   ├── index.html           # Home page with token minter
│   ├── about.html           # About page with project details
│   ├── assets/
│   │   ├── css/
│   │   │   ├── styles.css   # Styling
│   │   ├── js/
│   │   │   ├── app.js       # Web3.js integration
│   │   │   ├── web3.min.js  # Web3.js library
│   │   ├── images/          # Logos, favicon, and social icons
├── contracts/
│   ├── MintonToken.sol      # ERC-20 smart contract template
│   ├── MintonTokenFactory.sol # Factory contract for deploying new tokens
├── README.md                # Project documentation

## Setup Instructions
### Clone the Repository
```bash
git clone https://github.com/BrunoMarshall/mintonshardeum.git
cd mintonshardeum

Configure MetaMaskAdd the Shardeum Unstablenet endpoints to your wallet:Network Name: Shardeum Unstablenet
RPC Endpoint: https://api-unstable.shardeum.org
Chain ID: 8080
Currency Symbol: SHM
Explorer URL: https://explorer-unstable.shardeum.org/
Claim test SHM tokens from the Shardeum faucet (https://docs.shardeum.org/basics/claim) to cover gas fees.

Future UpdatesTransition to Shardeum Mainnet: comprehensive security audits before Mainnet launch!!!!

ContributingFeel free to fork this repository, submit issues, or pull requests to improve MintonShardeum!



