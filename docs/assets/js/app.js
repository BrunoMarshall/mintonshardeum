const web3 = new Web3(window.ethereum);

// Network configurations
const NETWORKS = {
  TESTNET: {
    chainId: '0x1FB7', // 8119
    chainIdNumber: 8119,
    chainName: 'Shardeum EVM Testnet',
    nativeCurrency: {
      name: 'Shardeum',
      symbol: 'SHM',
      decimals: 18
    },
    rpcUrls: ['https://api-mezame.shardeum.org/'],
    blockExplorerUrls: ['https://explorer-mezame.shardeum.org/'],
    factoryAddress: '0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4', // Your current testnet factory
    explorerUrl: 'https://explorer-mezame.shardeum.org'
  },
  MAINNET: {
    chainId: '0x1FB6', // 8118
    chainIdNumber: 8118,
    chainName: 'Shardeum',
    nativeCurrency: {
      name: 'Shardeum',
      symbol: 'SHM',
      decimals: 18
    },
    rpcUrls: ['https://api.shardeum.org/'],
    blockExplorerUrls: ['https://explorer.shardeum.org/'],
    factoryAddress: '0x294665ec45ab8668d922474f63a03e33416d8deb', // Mainnet factory
    explorerUrl: 'https://explorer.shardeum.org'
  }
};

// Current selected network (default to testnet)
let currentNetwork = 'TESTNET';

// Updated Factory ABI
const factoryABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "tokenName", "type": "string" },
      { "internalType": "string", "name": "tokenSymbol", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
      { "internalType": "uint256", "name": "maxSupply", "type": "uint256" },
      { "internalType": "bool", "name": "mintable", "type": "bool" }
    ],
    "name": "deployToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
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
  },
  {
    "inputs": [],
    "name": "deploymentFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }
    ],
    "name": "TokenDeployed",
    "type": "event"
  }
];

// Get factory contract for current network
function getFactoryContract() {
  const config = NETWORKS[currentNetwork];
  return new web3.eth.Contract(factoryABI, config.factoryAddress);
}

const connectButton = document.getElementById("connect-metamask");
const disconnectButton = document.getElementById("disconnect-metamask");
const connectionStatus = document.getElementById("connection-status");
const tokenForm = document.getElementById("token-form");
const status = document.getElementById("status");
const networkToggle = document.getElementById("network-toggle");
const networkIndicator = document.getElementById("network-indicator");

// Update network indicator styling
function updateNetworkIndicator() {
  if (!networkIndicator) return;
  
  const config = NETWORKS[currentNetwork];
  networkIndicator.textContent = currentNetwork === 'TESTNET' ? '🔧 TESTNET MODE' : '🚀 MAINNET MODE';
  networkIndicator.className = currentNetwork === 'TESTNET' ? 'network-indicator testnet' : 'network-indicator mainnet';
  
  // Update background gradient based on network
  document.body.className = currentNetwork === 'TESTNET' ? 'testnet-mode' : 'mainnet-mode';
}

// Network toggle handler
if (networkToggle) {
  networkToggle.addEventListener('change', async (e) => {
    currentNetwork = e.target.checked ? 'MAINNET' : 'TESTNET';
    updateNetworkIndicator();
    
    // Try to switch MetaMask to the selected network
    const config = NETWORKS[currentNetwork];
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }]
      });
    } catch (error) {
      if (error.code === 4902) {
        await addNetwork(currentNetwork);
      } else {
        console.error("Error switching network:", error);
      }
    }
    
    await updateConnectionStatus();
  });
}

// Function to add network to MetaMask
async function addNetwork(networkType) {
  const config = NETWORKS[networkType];
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: config.chainId,
        chainName: config.chainName,
        nativeCurrency: config.nativeCurrency,
        rpcUrls: config.rpcUrls,
        blockExplorerUrls: config.blockExplorerUrls
      }]
    });
    return true;
  } catch (error) {
    console.error("Error adding network:", error);
    return false;
  }
}

// Function to switch to selected network
async function switchToSelectedNetwork() {
  const config = NETWORKS[currentNetwork];
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainId }]
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      return await addNetwork(currentNetwork);
    }
    console.error("Error switching network:", error);
    return false;
  }
}

// Function to update connection status display
async function updateConnectionStatus() {
  if (!connectButton || !disconnectButton || !connectionStatus) {
    console.log("Wallet elements not found on this page");
    return;
  }

  try {
    const accounts = await web3.eth.getAccounts();
    const chainId = Number(await web3.eth.getChainId());
    const config = NETWORKS[currentNetwork];
    const expectedChainId = config.chainIdNumber;
    
    // Update network toggle position based on actual chain
    if (networkToggle && chainId === NETWORKS.TESTNET.chainIdNumber) {
      networkToggle.checked = false;
      currentNetwork = 'TESTNET';
      updateNetworkIndicator();
    } else if (networkToggle && chainId === NETWORKS.MAINNET.chainIdNumber) {
      networkToggle.checked = true;
      currentNetwork = 'MAINNET';
      updateNetworkIndicator();
    }
    
    if (accounts.length > 0) {
      const account = accounts[0];
      const shortAccount = `${account.slice(0, 6)}...${account.slice(-4)}`;
      
      const networkName = chainId === expectedChainId ? config.chainName : `Wrong Network (Chain ID: ${chainId})`;
      
      connectionStatus.textContent = `${networkName} | ${shortAccount}`;
      connectionStatus.style.display = "inline";
      disconnectButton.style.display = "inline-block";
      connectButton.style.display = "none";
      
      if (status) {
        if (chainId !== expectedChainId) {
          status.textContent = `⚠️ Please switch to ${config.chainName} (Chain ID: ${expectedChainId})`;
          status.style.color = "#FF6B6B";
        } else {
          status.textContent = `✓ Connected to ${config.chainName}`;
          status.style.color = currentNetwork === 'TESTNET' ? "#0024F1" : "#00C851";
        }
      }
    } else {
      connectionStatus.textContent = "";
      connectionStatus.style.display = "none";
      disconnectButton.style.display = "none";
      connectButton.style.display = "inline-block";
      connectButton.textContent = "Connect MetaMask";
      connectButton.disabled = false;
    }
  } catch (error) {
    console.error("Error updating connection status:", error);
    connectionStatus.textContent = "";
    connectionStatus.style.display = "none";
    disconnectButton.style.display = "none";
    connectButton.style.display = "inline-block";
    connectButton.textContent = "Connect MetaMask";
    connectButton.disabled = false;
  }
}

// Connect to MetaMask
if (connectButton) {
  connectButton.addEventListener("click", async () => {
    if (typeof window.ethereum === "undefined") {
      const message = "❌ MetaMask is not detected. Please install it.";
      if (status) {
        status.textContent = message;
        status.style.color = "#FF6B6B";
      } else {
        alert(message);
      }
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      const chainId = Number(await web3.eth.getChainId());
      const config = NETWORKS[currentNetwork];
      
      if (chainId !== config.chainIdNumber) {
        if (status) {
          status.textContent = `Switching to ${config.chainName}...`;
        }
        const switched = await switchToSelectedNetwork();
        if (!switched) {
          const message = `❌ Failed to switch network. Please add ${config.chainName} manually.`;
          if (status) {
            status.textContent = message;
            status.style.color = "#FF6B6B";
          } else {
            alert(message);
          }
          return;
        }
      }
      
      await updateConnectionStatus();
      if (status) {
        status.textContent = "✓ Connected to MetaMask!";
        status.style.color = currentNetwork === 'TESTNET' ? "#0024F1" : "#00C851";
      }
    } catch (error) {
      const message = `❌ Connection failed: ${error.message}`;
      if (status) {
        status.textContent = message;
        status.style.color = "#FF6B6B";
      } else {
        alert(message);
      }
      console.error("MetaMask Error:", error);
    }
  });
}

// Disconnect button handler
if (disconnectButton) {
  disconnectButton.addEventListener("click", async () => {
    try {
      connectionStatus.textContent = "";
      connectionStatus.style.display = "none";
      disconnectButton.style.display = "none";
      connectButton.style.display = "inline-block";
      connectButton.textContent = "Connect MetaMask";
      connectButton.disabled = false;
      if (status) {
        status.textContent = "Disconnected from MetaMask.";
        status.style.color = "#333333";
      }
    } catch (error) {
      console.error("Disconnect Error:", error);
      if (status) {
        status.textContent = `❌ Disconnect failed: ${error.message}`;
        status.style.color = "#FF6B6B";
      }
    }
  });
}

// Handle form submission to deploy new token
if (tokenForm) {
  tokenForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      status.textContent = "❌ Please connect MetaMask first!";
      status.style.color = "#FF6B6B";
      return;
    }
    
    const chainId = Number(await web3.eth.getChainId());
    const config = NETWORKS[currentNetwork];
    
    if (chainId !== config.chainIdNumber) {
      status.textContent = `❌ Please switch to ${config.chainName} (Chain ID: ${config.chainIdNumber})`;
      status.style.color = "#FF6B6B";
      return;
    }
    
    const tokenName = document.getElementById("token-name").value.trim();
    const tokenSymbol = document.getElementById("token-symbol").value.trim().toUpperCase();
    const initialSupplyInput = document.getElementById("initial-supply").value;
    const maxSupplyInput = document.getElementById("max-supply").value;
    const mintable = document.getElementById("mintable").checked;
    
    if (!tokenName || !tokenSymbol || !initialSupplyInput || !maxSupplyInput) {
      status.textContent = "❌ Please fill in all required fields!";
      status.style.color = "#FF6B6B";
      return;
    }
    
    if (tokenName.length > 50) {
      status.textContent = "❌ Token name must be 50 characters or less!";
      status.style.color = "#FF6B6B";
      return;
    }
    
    if (tokenSymbol.length > 10) {
      status.textContent = "❌ Token symbol must be 10 characters or less!";
      status.style.color = "#FF6B6B";
      return;
    }
    
    const initialSupply = web3.utils.toWei(initialSupplyInput, "ether");
    const maxSupply = web3.utils.toWei(maxSupplyInput, "ether");
    
    if (BigInt(initialSupply) > BigInt(maxSupply)) {
      status.textContent = "❌ Initial supply cannot exceed max supply!";
      status.style.color = "#FF6B6B";
      return;
    }
    
    try {
      status.textContent = "⏳ Deploying your token... Please wait and confirm in MetaMask.";
      status.style.color = "#FFA500";
      
      const factory = getFactoryContract();
      const deploymentFee = await factory.methods.deploymentFee().call();
      
      const tx = await factory.methods.deployToken(
        tokenName,
        tokenSymbol,
        initialSupply,
        maxSupply,
        mintable
      ).send({
        from: accounts[0],
        value: deploymentFee,
        maxFeePerGas: web3.utils.toWei('2500000', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('2500000', 'gwei'),
        gas: 3000000
      });
      
      let tokenAddress = "N/A";
      if (tx.events && tx.events.TokenDeployed) {
        tokenAddress = tx.events.TokenDeployed.returnValues.tokenAddress;
      }
      
      status.innerHTML = `✓ Token deployed successfully on ${config.chainName}!<br>
        <strong>Name:</strong> ${tokenName}<br>
        <strong>Symbol:</strong> ${tokenSymbol}<br>
        <strong>Address:</strong> <a href="${config.explorerUrl}/address/${tokenAddress}" target="_blank" style="color: ${currentNetwork === 'TESTNET' ? '#0024F1' : '#00C851'};">${tokenAddress}</a><br>
        <strong>Transaction:</strong> <a href="${config.explorerUrl}/tx/${tx.transactionHash}" target="_blank" style="color: ${currentNetwork === 'TESTNET' ? '#0024F1' : '#00C851'};">View on Explorer</a>`;
      status.style.color = currentNetwork === 'TESTNET' ? "#0024F1" : "#00C851";
      
      tokenForm.reset();
      
    } catch (error) {
      console.error("Deployment Error:", error);
      
      let errorMessage = "❌ Deployment failed: ";
      if (error.message.includes("user rejected")) {
        errorMessage += "Transaction was rejected.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage += "Insufficient SHM balance. You need at least 5000 SHM plus gas fees.";
      } else {
        errorMessage += error.message;
      }
      
      status.textContent = errorMessage;
      status.style.color = "#FF6B6B";
    }
  });
}

// Check network and connection on load
window.addEventListener("load", async () => {
  console.log("🎬 App.js loaded with network switching");
  
  updateNetworkIndicator();
  
  if (window.ethereum) {
    const chainId = Number(await web3.eth.getChainId());
    
    // Auto-detect and set network based on current chain
    if (chainId === NETWORKS.MAINNET.chainIdNumber) {
      currentNetwork = 'MAINNET';
      if (networkToggle) networkToggle.checked = true;
      updateNetworkIndicator();
    } else if (chainId === NETWORKS.TESTNET.chainIdNumber) {
      currentNetwork = 'TESTNET';
      if (networkToggle) networkToggle.checked = false;
      updateNetworkIndicator();
    }
    
    const config = NETWORKS[currentNetwork];
    
    if (status) {
      if (chainId !== config.chainIdNumber) {
        status.textContent = `⚠️ Please connect MetaMask and switch to ${config.chainName} (Chain ID: ${config.chainIdNumber})`;
        status.style.color = "#FFA500";
      } else {
        status.textContent = `Ready. Connect MetaMask to deploy tokens on ${config.chainName}.`;
        status.style.color = currentNetwork === 'TESTNET' ? "#0024F1" : "#00C851";
      }
    }
    
    await updateConnectionStatus();
  } else {
    if (status) {
      status.textContent = "❌ MetaMask not detected. Please install it.";
      status.style.color = "#FF6B6B";
    }
  }
});

// Listen for account or network changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", updateConnectionStatus);
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
