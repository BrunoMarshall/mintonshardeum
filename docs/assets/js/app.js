const web3 = new Web3(window.ethereum);
const factoryABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
      { "internalType": "uint256", "name": "maxSupply", "type": "uint256" },
      { "internalType": "bool", "name": "mintable", "type": "bool" },
      { "internalType": "address", "name": "feeCollectorOverride", "type": "address" }
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
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" }
    ],
    "name": "TokenDeployed",
    "type": "event"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];
const factoryAddress = "0x20adb0e2472caa768cfa3ae671d4423878719225";
const factory = new web3.eth.Contract(factoryABI, factoryAddress);
const connectButton = document.getElementById("connect-metamask");
const disconnectButton = document.getElementById("disconnect-metamask");
const connectionStatus = document.getElementById("connection-status");
const tokenForm = document.getElementById("token-form");
const status = document.getElementById("status");

// Map chain IDs to network names
const networkNames = {
  8080: "Shardeum Unstablenet",
  8081: "Shardeum Testnet",
  8082: "Shardeum Mainnet"
};

// Function to update connection status display
async function updateConnectionStatus() {
  try {
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    const networkName = networkNames[chainId] || `Unknown Network (Chain ID: ${chainId})`;
    if (accounts.length > 0) {
      const account = accounts[0];
      const shortAccount = `${account.slice(0, 6)}...${account.slice(-4)}`;
      connectionStatus.textContent = `Network: ${networkName} | Wallet: ${shortAccount}`;
      connectionStatus.style.display = "inline";
      disconnectButton.style.display = "inline-block";
      connectButton.style.display = "none";
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
connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    status.textContent = "MetaMask is not detected. Please install it.";
    console.error("MetaMask is not installed.");
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await updateConnectionStatus();
    status.textContent = "Connected to MetaMask!";
  } catch (error) {
    status.textContent = `Connection failed: ${error.message}. Ensure MetaMask is on Shardeum Unstablenet.`;
    console.error("MetaMask Error:", error);
  }
});

// Disconnect button handler
disconnectButton.addEventListener("click", async () => {
  try {
    // Reset UI to disconnected state
    connectionStatus.textContent = "";
    connectionStatus.style.display = "none";
    disconnectButton.style.display = "none";
    connectButton.style.display = "inline-block";
    connectButton.textContent = "Connect MetaMask";
    connectButton.disabled = false;
    status.textContent = "Disconnected from MetaMask.";
  } catch (error) {
    console.error("Disconnect Error:", error);
    status.textContent = `Disconnect failed: ${error.message}`;
  }
});

// Handle form submission to deploy new token
tokenForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const accounts = await web3.eth.getAccounts();
  if (!accounts || accounts.length === 0) {
    status.textContent = "Please connect MetaMask first!";
    return;
  }
  const tokenName = document.getElementById("token-name").value;
  const tokenSymbol = document.getElementById("token-symbol").value;
  const initialSupply = web3.utils.toWei(document.getElementById("initial-supply").value, "ether");
  const maxSupply = web3.utils.toWei(document.getElementById("max-supply").value, "ether");
  const mintable = document.getElementById("mintable").checked;
  const feeCollectorOverride = "0x0eE1b98198E400d8Da9E5431F477C0A1A2269505";
  try {
    const deploymentFee = web3.utils.toWei("10", "ether");
    const gasPrice = await web3.eth.getGasPrice();
    const tx = await factory.methods.deployToken(
      tokenName,
      tokenSymbol,
      initialSupply,
      maxSupply,
      mintable,
      feeCollectorOverride
    ).send({
      from: accounts[0],
      value: deploymentFee,
      gas: 4000000,
      gasPrice: gasPrice
    });
    status.textContent = `New token deployed! Name: ${tokenName}, Symbol: ${tokenSymbol}, Address: ${tx.events.TokenDeployed.returnValues.tokenAddress}`;
  } catch (error) {
    status.textContent = `Deployment failed: ${error.message}`;
    console.error("Deployment Error:", error);
  }
});

// Check network and connection on load
window.addEventListener("load", async () => {
  if (window.ethereum) {
    const chainId = await web3.eth.getChainId();
    if (chainId !== 8080) {
      status.textContent = "Please switch to Shardeum Unstablenet (Chain ID: 8080) in MetaMask!";
    } else {
      status.textContent = "Ready. Connect MetaMask to proceed.";
    }
    await updateConnectionStatus();
  } else {
    status.textContent = "MetaMask not detected. Please install it.";
  }
});

// Listen for account or network changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", updateConnectionStatus);
  window.ethereum.on("chainChanged", updateConnectionStatus);
}