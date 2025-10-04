const web3 = new Web3(window.ethereum);

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
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const factoryAddress = "0xd0056b6ade1c238b27f0fa77eda0d7c86ab04a24";
const factory = new web3.eth.Contract(factoryABI, factoryAddress);

let allTokens = [];
let filteredTokens = [];
let currentPage = 1;
const tokensPerPage = 12;

// Fetch token details
async function getTokenDetails(tokenAddress) {
  try {
    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    
    const [name, symbol, totalSupply, maxSupply, mintable, decimals] = await Promise.all([
      tokenContract.methods.name().call(),
      tokenContract.methods.symbol().call(),
      tokenContract.methods.totalSupply().call(),
      tokenContract.methods.maxSupply().call(),
      tokenContract.methods.mintable().call(),
      tokenContract.methods.decimals().call()
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      totalSupply: web3.utils.fromWei(totalSupply, 'ether'),
      maxSupply: web3.utils.fromWei(maxSupply, 'ether'),
      mintable,
      decimals
    };
  } catch (error) {
    console.error(`Error fetching details for ${tokenAddress}:`, error);
    return null;
  }
}

// Load all tokens
async function loadTokens() {
  const container = document.getElementById('tokens-container');
  const totalTokensEl = document.getElementById('total-tokens');
  
  try {
    container.innerHTML = '<div class="loading">Loading tokens...</div>';
    
    // Get all token addresses
    const tokenAddresses = await factory.methods.getDeployedTokens().call();
    
    if (tokenAddresses.length === 0) {
      container.innerHTML = '<div class="no-tokens">No tokens have been created yet.</div>';
      totalTokensEl.textContent = '0';
      return;
    }

    totalTokensEl.textContent = tokenAddresses.length;
    
    // Fetch details for all tokens (reverse to show newest first)
    const tokenPromises = tokenAddresses.reverse().map(addr => getTokenDetails(addr));
    const tokenDetails = await Promise.all(tokenPromises);
    
    // Filter out any failed requests
    allTokens = tokenDetails.filter(token => token !== null);
    filteredTokens = [...allTokens];
    
    displayTokens();
    
  } catch (error) {
    console.error('Error loading tokens:', error);
    container.innerHTML = '<div class="error">Failed to load tokens. Please try again.</div>';
  }
}

// Display tokens with pagination
function displayTokens() {
  const container = document.getElementById('tokens-container');
  const start = (currentPage - 1) * tokensPerPage;
  const end = start + tokensPerPage;
  const tokensToDisplay = filteredTokens.slice(start, end);
  
  if (tokensToDisplay.length === 0) {
    container.innerHTML = '<div class="no-tokens">No tokens found.</div>';
    return;
  }
  
  container.innerHTML = tokensToDisplay.map(token => `
    <div class="token-card">
      <div class="token-header">
        <h3>${token.name}</h3>
        <span class="token-symbol">${token.symbol}</span>
      </div>
      <div class="token-details">
        <div class="detail-row">
          <span class="detail-label">Total Supply:</span>
          <span class="detail-value">${formatNumber(token.totalSupply)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Max Supply:</span>
          <span class="detail-value">${formatNumber(token.maxSupply)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mintable:</span>
          <span class="detail-value ${token.mintable ? 'mintable-yes' : 'mintable-no'}">
            ${token.mintable ? 'Yes' : 'No'}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span class="detail-value address-short">${token.address.slice(0, 6)}...${token.address.slice(-4)}</span>
        </div>
      </div>
      <div class="token-actions">
        <a href="https://explorer-mezame.shardeum.org/address/${token.address}" target="_blank" class="btn-view">
          View on Explorer
        </a>
        <button class="btn-copy" onclick="copyAddress('${token.address}')">
          Copy Address
        </button>
      </div>
    </div>
  `).join('');
  
  updatePagination();
}

// Format large numbers
function formatNumber(num) {
  const number = parseFloat(num);
  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + 'K';
  }
  return number.toFixed(2);
}

// Copy address to clipboard
function copyAddress(address) {
  navigator.clipboard.writeText(address).then(() => {
    alert('Address copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Update pagination controls
function updatePagination() {
  const pagination = document.getElementById('pagination');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageInfo = document.getElementById('page-info');
  
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage);
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Search/filter tokens
function filterTokens(searchTerm) {
  const term = searchTerm.toLowerCase();
  filteredTokens = allTokens.filter(token => 
    token.name.toLowerCase().includes(term) ||
    token.symbol.toLowerCase().includes(term) ||
    token.address.toLowerCase().includes(term)
  );
  currentPage = 1;
  displayTokens();
}

// Event listeners
document.getElementById('search-input').addEventListener('input', (e) => {
  filterTokens(e.target.value);
});

document.getElementById('refresh-btn').addEventListener('click', () => {
  loadTokens();
});

document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayTokens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayTokens();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Load tokens on page load
window.addEventListener('load', () => {
  loadTokens();
});