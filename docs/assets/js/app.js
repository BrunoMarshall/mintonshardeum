// assets/js/app.js

const Web3 = require('web3');
const web3 = new Web3(window.ethereum); // Original initialization

// Factory ABI
const factoryABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "symbol", "type": "string"},
            {"internalType": "uint256", "name": "initialSupply", "type": "uint256"},
            {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
            {"internalType": "bool", "name": "mintable", "type": "bool"},
            {"internalType": "address", "name": "feeCollectorOverride", "type": "address"}
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
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "feeCollector",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Factory address
const factoryAddress = "0x3be7b13b8fda2cfae58a1c13c0021ad075ca0666"; // From transaction
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
        if (accounts.length > 0) {
            const account = accounts[0];
            status.textContent = `Connected: ${account}`;
            connectButton.textContent = "Connected";
            connectButton.disabled = true;
        } else {
            status.textContent = "No accounts found. Please unlock MetaMask.";
        }
    } catch (error) {
        status.textContent = `Connection failed: ${error.message}. Ensure MetaMask is on Shardeum Unstablenet.`;
        console.error("MetaMask Error:", error);
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
    const decimals = parseInt(document.getElementById("decimals").value); // Unused but kept
    const mintable = document.getElementById("mintable").checked;
    const feeCollectorOverride = "0x0eE1b98198E400d8Da9E5431F477C0A1A2269505";

    // Validate inputs
    if (parseInt(initialSupply) > parseInt(maxSupply)) {
        status.textContent = "Initial supply cannot exceed max supply.";
        return;
    }

    try {
        const deploymentFee = web3.utils.toWei("10", "ether");
        const gasPrice = await web3.eth.getGasPrice();
        status.textContent = "Deploying token...";
        const tx = await factory.methods
            .deployToken(tokenName, tokenSymbol, initialSupply, maxSupply, mintable, feeCollectorOverride)
            .send({
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

// Check network on load
window.addEventListener("load", async () => {
    if (window.ethereum) {
        const chainId = await web3.eth.getChainId();
        if (chainId !== 8080) {
            status.textContent = "Please switch to Shardeum Unstablenet (Chain ID: 8080) in MetaMask!";
        } else {
            status.textContent = "Ready. Connect MetaMask to proceed.";
        }
    } else {
        status.textContent = "MetaMask not detected. Please install it.";
    }
});