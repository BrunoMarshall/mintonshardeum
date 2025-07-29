// docs/assets/js/app.js

const web3 = new Web3(window.ethereum);

// Factory ABI
const factoryABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "uint256", "name": "initialSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
      {"internalType": "bool", "name": "mintable", "type": "bool"}
    ],
    "name": "deployToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeployedTokens",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "symbol", "type": "string"}
    ],
    "name": "TokenDeployed",
    "type": "event"
  }
];

// Factory address
const factoryAddress = "0x1eadb39906cec62a5b0d4913e8b72594a3cd3499"; // Your deployed factory address
const factory = new web3.eth.Contract(factoryABI, factoryAddress);

// DOM elements
const connectButton = document.getElementById("connect-metamask");
const tokenForm = document.getElementById("token-form");
const status = document.getElementById("status");

// Connect to MetaMask
connectButton.addEventListener("click", async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    status.textContent = `Connected: ${accounts[0]}`;
    connectButton.disabled = true;
  } catch (error) {
    status.textContent = `Connection failed: ${error.message}`;
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
  const decimals = parseInt(document.getElementById("decimals").value);
  const mintable = document.getElementById("mintable").checked;
  const network = document.getElementById("network").value;

  try {
    const deploymentFee = web3.utils.toWei("10", "ether"); // 10 SHM
    const tx = await factory.methods.deployToken(tokenName, tokenSymbol, initialSupply, maxSupply, mintable).send({
      from: accounts[0],
      value: deploymentFee
    });
    status.textContent = `New token deployed! Name: ${tokenName}, Symbol: ${tokenSymbol}, Address: ${tx.events.TokenDeployed.returnValues.tokenAddress}`;
  } catch (error) {
    status.textContent = `Deployment failed: ${error.message}`;
  }
});

// Check network on load
window.addEventListener("load", async () => {
  if (window.ethereum) {
    const chainId = await web3.eth.getChainId();
    if (chainId !== 8080) {
      status.textContent = "Please switch to Shardeum Unstablenet (Chain ID: 8080) in MetaMask!";
    }
  }
});