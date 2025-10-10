const web3 = new Web3(window.ethereum);

// Updated Factory ABI with all new functions
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

const factoryAddress = "0xaebf3ca591dec4f3bf738a6b993ffe048f359fd4";
const factory = new web3.eth.Contract(factoryABI, factoryAddress);

const connectButton = document.getElementById("connect-metamask");
const disconnectButton = document.getElementById("disconnect-metamask");
const connectionStatus = document.getElementById("connection-status");
const tokenForm = document.getElementById("token-form");
const status = document.getElementById("status");

// Shardeum network configuration
const SHARDEUM_TESTNET = {
  chainId: '0x1FB7',
  chainName: 'Shardeum EVM Testnet',
  nativeCurrency: {
    name: 'Shardeum',
    symbol: 'SHM',
    decimals: 18
  },
  rpcUrls: ['https://api-mezame.shardeum.org/'],
  blockExplorerUrls: ['https://explorer-mezame.shardeum.org/']
};

const networkNames = {
  8119: "Shardeum EVM Testnet",
  8080: "Shardeum Unstablenet (Deprecated)"
};

// Function to add Shardeum network to MetaMask
async function addShardeumNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [SHARDEUM_TESTNET]
    });
    return true;
  } catch (error) {
    console.error("Error adding network:", error);
    return false;
  }
}

// Function to switch to Shardeum network
async function switchToShardeumNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SHARDEUM_TESTNET.chainId }]
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      return await addShardeumNetwork();
    }
    console.error("Error switching network:", error);
    return false;
  }
}

// Function to update connection status display
async function updateConnectionStatus() {
  // Check if wallet elements exist on this page
  if (!connectButton || !disconnectButton || !connectionStatus) {
    console.log("Wallet elements not found on this page");
    return;
  }

  try {
    const accounts = await web3.eth.getAccounts();
    const chainId = Number(await web3.eth.getChainId());
    const networkName = networkNames[chainId] || `Unknown Network (Chain ID: ${chainId})`;
    
    if (accounts.length > 0) {
      const account = accounts[0];
      const shortAccount = `${account.slice(0, 6)}...${account.slice(-4)}`;
      connectionStatus.textContent = `${networkName} | ${shortAccount}`;
      connectionStatus.style.display = "inline";
      disconnectButton.style.display = "inline-block";
      connectButton.style.display = "none";
      
      // Only update status if it exists (on index page)
      if (status) {
        if (chainId !== 8119) {
          status.textContent = "⚠️ Please switch to Shardeum EVM Testnet (Chain ID: 8119)";
          status.style.color = "#FF6B6B";
        } else {
          status.textContent = "✓ Connected to Shardeum EVM Testnet";
          status.style.color = "#0024F1";
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
      if (chainId !== 8119) {
        if (status) {
          status.textContent = "Switching to Shardeum EVM Testnet...";
        }
        const switched = await switchToShardeumNetwork();
        if (!switched) {
          const message = "❌ Failed to switch network. Please add Shardeum EVM Testnet manually.";
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
        status.style.color = "#0024F1";
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

// Handle form submission to deploy new token (only on index page)
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
    if (chainId !== 8119) {
      status.textContent = "❌ Please switch to Shardeum EVM Testnet (Chain ID: 8119)";
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
      
      status.innerHTML = `✓ Token deployed successfully!<br>
        <strong>Name:</strong> ${tokenName}<br>
        <strong>Symbol:</strong> ${tokenSymbol}<br>
        <strong>Address:</strong> <a href="https://explorer-mezame.shardeum.org/address/${tokenAddress}" target="_blank" style="color: #0024F1;">${tokenAddress}</a><br>
        <strong>Transaction:</strong> <a href="https://explorer-mezame.shardeum.org/tx/${tx.transactionHash}" target="_blank" style="color: #0024F1;">View on Explorer</a>`;
      status.style.color = "#00C851";
      
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
  console.log("🎬 App.js loaded");
  
  if (window.ethereum) {
    const chainId = Number(await web3.eth.getChainId());
    
    // Only show status messages if status element exists
    if (status) {
      if (chainId !== 8119) {
        status.textContent = "⚠️ Please connect MetaMask and switch to Shardeum EVM Testnet (Chain ID: 8119)";
        status.style.color = "#FFA500";
      } else {
        status.textContent = "Ready. Connect MetaMask to deploy tokens.";
        status.style.color = "#0024F1";
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