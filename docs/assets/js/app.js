// assets/js/app.js

// Debugging: Log script loading
console.log("app.js loaded");

const Web3 = require('web3');

// Check for MetaMask
if (!window.ethereum) {
    console.error("MetaMask not detected. Please install MetaMask.");
    document.getElementById("status").textContent = "MetaMask not detected. Please install it.";
}

// Initialize Web3
const web3 = new Web3(window.ethereum);

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
const factoryAddress = "0x3be7b13b8fda2cfae58a1c13c0021ad075ca0666";
const factory = new web3.eth.Contract(factoryABI, factoryAddress);

// DOM elements
const connectButton = document.getElementById("connect-metamask");
const disconnectButton = document.getElementById("disconnect-metamask");
const walletAddressDisplay = document.getElementById("wallet-address");
const tokenForm = document.getElementById("token-form");
const status = document.getElementById("status");

// Debugging: Verify DOM elements
if (!connectButton) console.error("Connect button not found");
if (!disconnectButton) console.error("Disconnect button not found");
if (!walletAddressDisplay) console.error("Wallet address display not found");
if (!tokenForm) console.error("Token form not found");
if (!status) console.error("Status element not found");

// Connect to MetaMask
connectButton.addEventListener("click", async () => {
    console.log("Connect MetaMask button clicked");
    try {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        console.log("Accounts retrieved:", accounts);
        if (accounts.length > 0) {
            const account = accounts[0];
            // Truncate address for display (first 6 and last 4 characters)
            const truncatedAddress = `${account.slice(0, 6)}…${account.slice(-4)}`;
            walletAddressDisplay.textContent = `Connected: ${truncatedAddress}`;
            connectButton.style.display = "none";
            disconnectButton.style.display = "inline-block";
            status.textContent = "Ready to deploy tokens.";
        } else {
            status.textContent = "No accounts found. Please unlock MetaMask.";
            console.warn("No accounts returned from MetaMask");
        }
    } catch (error) {
        status.textContent = `Connection failed: ${error.message}. Ensure MetaMask is on Shardeum Unstablenet.`;
        console.error("MetaMask Connection Error:", error);
    }
});

// Disconnect MetaMask
disconnectButton.addEventListener("click", async () => {
    console.log("Disconnect MetaMask button clicked");
    try {
        // Clear wallet display and reset UI
        walletAddressDisplay.textContent = "";
        connectButton.style.display = "inline-block";
        disconnectButton.style.display = "none";
        status.textContent = "Disconnected. Connect MetaMask to proceed.";
    } catch (error) {
        status.textContent = `Disconnection failed: ${error.message}`;
        console.error("Disconnect Error:", error);
    }
});

// Handle form submission to deploy new token
tokenForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Token form submitted");

    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
        status.textContent = "Please connect MetaMask first!";
        console.warn("No accounts connected");
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
        console.warn("Invalid input: initialSupply > maxSupply");
        return;
    }

    try {
        const deploymentFee = web3.utils.toWei("10", "ether");
        const gasPrice = await web3.eth.getGasPrice();
        console.log("Deploying token with params:", { tokenName, tokenSymbol, initialSupply, maxSupply, mintable, feeCollectorOverride });
        status.textContent = "Deploying token...";
        const tx = await factory.methods
            .deployToken(tokenName, tokenSymbol, initialSupply, maxSupply, mintable, feeCollectorOverride)
            .send({
                from: accounts[0],
                value: deploymentFee,
                gas: 4000000,
                gasPrice: gasPrice
            });
        console.log("Transaction successful:", tx);
        status.textContent = `New token deployed! Name: ${tokenName}, Symbol: ${tokenSymbol}, Address: ${tx.events.TokenDeployed.returnValues.tokenAddress}`;
    } catch (error) {
        status.textContent = `Deployment failed: ${error.message}`;
        console.error("Deployment Error:", error);
    }
});

// Check network on load
window.addEventListener("load", async () => {
    console.log("Window loaded, checking network");
    if (window.ethereum) {
        try {
            const chainId = await web3.eth.getChainId();
            console.log("Chain ID:", chainId);
            if (chainId !== 8080) {
                status.textContent = "Please switch to Shardeum Unstablenet (Chain ID: 8080) in MetaMask!";
            } else {
                status.textContent = "Ready. Connect MetaMask to proceed.";
            }
        } catch (error) {
            status.textContent = "Failed to check network. Ensure MetaMask is installed.";
            console.error("Network Check Error:", error);
        }
    } else {
        status.textContent = "MetaMask not detected. Please install it.";
        console.error("MetaMask not detected on window load");
    }
});