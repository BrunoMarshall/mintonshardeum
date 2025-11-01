const web3 = new Web3(window.ethereum);

// Network configurations
const NETWORKS = {
  TESTNET: {
    chainId: '0x1FB7',
    chainIdNumber: 8119,
    factoryAddress: '0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4',
    explorerUrl: 'https://explorer-mezame.shardeum.org'
  },
  MAINNET: {
    chainId: '0x1FB6',
    chainIdNumber: 8118,
    factoryAddress: '0x294665ec45ab8668d922474f63a03e33416d8deb',
    explorerUrl: 'https://explorer.shardeum.org'
  }
};

// Current network (detect from chain)
let currentNetwork = 'MAINNET';

const factoryABI = [
  {
    "inputs": [],
    "name": "getDeployedTokens",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeployedTokenCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const tokenABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintable",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Get current network config
async function getCurrentNetworkConfig() {
  try {
    const chainId = Number(await web3.eth.getChainId());
    if (chainId === NETWORKS.TESTNET.chainIdNumber) {
      currentNetwork = 'TESTNET';
      return NETWORKS.TESTNET;
    } else if (chainId === NETWORKS.MAINNET.chainIdNumber) {
      currentNetwork = 'MAINNET';
      return NETWORKS.MAINNET;
    }
    // Default to mainnet
    return NETWORKS.MAINNET;
  } catch (error) {
    console.error("Error detecting network:", error);
    return NETWORKS.MAINNET;
  }
}

// Function to add token to MetaMask
async function addTokenToMetaMask(address, symbol, decimals, logoUrl = null) {
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: address,
          symbol: symbol,
          decimals: decimals,
          image: logoUrl
        },
      },
    });

    if (wasAdded) {
      console.log('Token added to MetaMask!');
      return true;
    } else {
      console.log('Token addition cancelled');
      return false;
    }
  } catch (error) {
    console.error('Error adding token to MetaMask:', error);
    alert('Failed to add token to MetaMask. Please try again.');
    return false;
  }
}

async function loadTokens() {
  const tokenContainer = document.getElementById('tokens-container');
  const totalTokensElement = document.getElementById('total-tokens');
  
  // Check if elements exist
  if (!tokenContainer) {
    console.error('Token container element not found');
    return;
  }
  
  try {
    const config = await getCurrentNetworkConfig();
    const factory = new web3.eth.Contract(factoryABI, config.factoryAddress);
    
    const tokenAddresses = await factory.methods.getDeployedTokens().call();
    
    // Update total tokens counter
    if (totalTokensElement) {
      totalTokensElement.textContent = tokenAddresses.length;
    }
    
    if (!tokenAddresses || tokenAddresses.length === 0) {
      tokenContainer.innerHTML = 
        '<p style="text-align: center; color: #666; padding: 40px;">No tokens deployed yet on ' + 
        (currentNetwork === 'TESTNET' ? 'Testnet' : 'Mainnet') + '</p>';
      return;
    }
    
    // Clear container and set it up as a grid
    tokenContainer.innerHTML = '';
    tokenContainer.className = 'tokens-grid';
    
    for (const address of tokenAddresses) {
      try {
        const token = new web3.eth.Contract(tokenABI, address);
        
        const name = await token.methods.name().call();
        const symbol = await token.methods.symbol().call();
        const totalSupply = await token.methods.totalSupply().call();
        const maxSupply = await token.methods.maxSupply().call();
        const mintable = await token.methods.mintable().call();
        const decimals = await token.methods.decimals().call();
        
        const tokenCard = document.createElement('div');
        tokenCard.className = 'token-card';
        tokenCard.innerHTML = `
          <h3>${name} (${symbol})</h3>
          <p><strong>Address:</strong> <a href="${config.explorerUrl}/address/${address}" target="_blank">${address.slice(0, 10)}...${address.slice(-8)}</a></p>
          <p><strong>Supply:</strong> ${web3.utils.fromWei(totalSupply, 'ether')} / ${web3.utils.fromWei(maxSupply, 'ether')}</p>
          <p><strong>Mintable:</strong> ${mintable ? 'Yes' : 'No'}</p>
          <p class="network-badge ${currentNetwork === 'TESTNET' ? 'testnet' : 'mainnet'}">
            ${currentNetwork === 'TESTNET' ? '🔧 Testnet' : '🟢 Mainnet'}
          </p>
          <button class="add-to-metamask-btn" data-address="${address}" data-symbol="${symbol}" data-decimals="${decimals}">
            🦊 Add to MetaMask
          </button>
        `;
        
        tokenContainer.appendChild(tokenCard);
      } catch (tokenError) {
        console.error(`Error loading token ${address}:`, tokenError);
      }
    }
    
    // Add click event listeners to all "Add to MetaMask" buttons
    const addButtons = document.querySelectorAll('.add-to-metamask-btn');
    addButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const address = btn.getAttribute('data-address');
        const symbol = btn.getAttribute('data-symbol');
        const decimals = parseInt(btn.getAttribute('data-decimals'));
        
        btn.textContent = '⏳ Adding...';
        btn.disabled = true;
        
        const success = await addTokenToMetaMask(address, symbol, decimals);
        
        if (success) {
          btn.textContent = '✅ Added!';
          setTimeout(() => {
            btn.textContent = '🦊 Add to MetaMask';
            btn.disabled = false;
          }, 3000);
        } else {
          btn.textContent = '🦊 Add to MetaMask';
          btn.disabled = false;
        }
      });
    });
    
  } catch (error) {
    console.error('Error loading tokens:', error);
    if (totalTokensElement) {
      totalTokensElement.textContent = 'Error';
    }
    tokenContainer.innerHTML = 
      '<p style="text-align: center; color: #FF6B6B; padding: 40px;">Error loading tokens. Please make sure you\'re connected to the correct network.</p>';
  }
}

// Network toggle handler
const networkToggle = document.getElementById('network-toggle');
const networkIndicator = document.getElementById('network-indicator');

function updateNetworkIndicator() {
  if (!networkIndicator) return;
  
  if (currentNetwork === 'TESTNET') {
    networkIndicator.textContent = '🔧 TESTNET';
    networkIndicator.className = 'network-indicator testnet';
    document.body.classList.remove('mainnet-mode');
    document.body.classList.add('testnet-mode');
  } else {
    networkIndicator.textContent = '🟢 MAINNET';
    networkIndicator.className = 'network-indicator mainnet';
    document.body.classList.remove('testnet-mode');
    document.body.classList.add('mainnet-mode');
  }
}

if (networkToggle) {
  networkToggle.addEventListener('change', async (e) => {
    currentNetwork = e.target.checked ? 'TESTNET' : 'MAINNET';
    updateNetworkIndicator();
    
    const config = NETWORKS[currentNetwork];
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }]
      });
      // Reload tokens after network switch
      await loadTokens();
    } catch (error) {
      console.error("Error switching network:", error);
    }
  });
}

// Refresh button handler
const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;
    await loadTokens();
    refreshBtn.textContent = 'Refresh';
    refreshBtn.disabled = false;
  });
}

// Load on page load
window.addEventListener('load', async () => {
  updateNetworkIndicator();
  
  if (window.ethereum) {
    await loadTokens();
    
    // Listen for network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  } else {
    const tokenContainer = document.getElementById('tokens-container');
    const totalTokensElement = document.getElementById('total-tokens');
    
    if (totalTokensElement) {
      totalTokensElement.textContent = '0';
    }
    if (tokenContainer) {
      tokenContainer.innerHTML = 
        '<p style="text-align: center; color: #FF6B6B; padding: 40px;">Please install MetaMask to view tokens.</p>';
    }
  }
});