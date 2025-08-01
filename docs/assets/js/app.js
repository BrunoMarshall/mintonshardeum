// assets/js/app.js

const Web3 = require('web3'); // For Node.js environment
const web3 = new Web3(window.ethereum || 'https://unstable-testnet.shardeum.org'); // Replace with correct RPC URL

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
        "name": "feeCollector",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// MintonToken ABI
const mintonTokenABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeCollector",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "userAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256"},
            {"indexed": false, "internalType": "address", "name": "feeCollectorAddr", "type": "address"}
        ],
        "name": "MintWithFee",
        "type": "event"
    }
];

// Factory address (updated to the deployed contract from your transaction)
const factoryAddress = "0x3be7b13b8fda2cfae58a1c13c0021ad075ca0666";
const factory = new web3.eth.Contract(factoryABI, factoryAddress);

// DOM elements
const connectButton = document.getElementById("connect-metamask");
const tokenForm = document.getElementById("token-form");
const mintForm = document.getElementById("mint-form");
const tokenAddressSelect = document.getElementById("token-address");
const refreshTokensButton = document.getElementById("refresh-tokens");
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
            await populateTokenList(); // Populate token list after connecting
        } else {
            status.textContent = "No accounts found. Please unlock MetaMask.";
            status.className = "error";
        }
    } catch (error) {
        status.textContent = `Connection failed: ${error.message}. Ensure MetaMask is on Shardeum Unstable Testnet.`;
        status.className = "error";
        console.error("MetaMask Error:", error);
    }
});

// Populate token dropdown with deployed tokens
async function populateTokenList() {
    try {
        const tokens = await factory.methods.getDeployedTokens().call();
        tokenAddressSelect.innerHTML = '<option value="">-- Select a deployed token --</option>';
        for (const token of tokens) {
            const tokenContract = new web3.eth.Contract(mintonTokenABI, token);
            const name = await tokenContract.methods.name().call();
            const symbol = await tokenContract.methods.symbol().call();
            const option = document.createElement("option");
            option.value = token;
            option.textContent = `${name} (${symbol}) - ${token}`;
            tokenAddressSelect.appendChild(option);
        }
    } catch (error) {
        status.textContent = `Failed to load token list: ${error.message}`;
        status.className = "error";
        console.error("Token List Error:", error);
    }
}

// Refresh token list
refreshTokensButton.addEventListener("click", async () => {
    status.textContent = "Refreshing token list...";
    await populateTokenList();
    status.textContent = "Token list refreshed.";
});

// Handle deploy token form submission
tokenForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
        status.textContent = "Please connect MetaMask first!";
        status.className = "error";
        return;
    }

    const tokenName = document.getElementById("token-name").value;
    const tokenSymbol = document.getElementById("token-symbol").value;
    const initialSupply = document.getElementById("initial-supply").value;
    const maxSupply = document.getElementById("max-supply").value;
    const mintable = document.getElementById("mintable").checked;
    const feeCollector = document.getElementById("fee-collector").value;
    const network = document.getElementById("network").value;

    // Validate inputs
    if (!web3.utils.isAddress(feeCollector)) {
        status.textContent = "Invalid fee collector address.";
        status.className = "error";
        return;
    }
    if (parseInt(initialSupply) > parseInt(maxSupply)) {
        status.textContent = "Initial supply cannot exceed max supply.";
        status.className = "error";
        return;
    }
    if (network !== "testnet") {
        status.textContent = "Only Shardeum Unstable Testnet is supported.";
        status.className = "error";
        return;
    }

    try {
        const initialSupplyWei = web3.utils.toWei(initialSupply, "ether");
        const maxSupplyWei = web3.utils.toWei(maxSupply, "ether");
        const deploymentFee = web3.utils.toWei("10", "ether");
        const gasPrice = await web3.eth.getGasPrice();

        status.textContent = "Deploying token...";
        const tx = await factory.methods
            .deployToken(tokenName, tokenSymbol, initialSupplyWei, maxSupplyWei, mintable, feeCollector)
            .send({
                from: accounts[0],
                value: deploymentFee,
                gas: 4000000,
                gasPrice: gasPrice
            });

        const tokenAddress = tx.events.TokenDeployed.returnValues.tokenAddress;
        status.textContent = `New token deployed! Name: ${tokenName}, Symbol: ${tokenSymbol}, Address: ${tokenAddress}`;
        status.className = "";
        await populateTokenList(); // Refresh token list after deployment
    } catch (error) {
        status.textContent = `Deployment failed: ${error.message}`;
        status.className = "error";
        console.error("Deployment Error:", error);
    }
});

// Handle mint tokens form submission
mintForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
        status.textContent = "Please connect MetaMask first!";
        status.className = "error";
        return;
    }

    const tokenAddress = document.getElementById("token-address").value;
    const mintAmount = document.getElementById("mint-amount").value;

    // Validate inputs
    if (!web3.utils.isAddress(tokenAddress)) {
        status.textContent = "Invalid token contract address.";
        status.className = "error";
        return;
    }
    if (parseInt(mintAmount) <= 0) {
        status.textContent = "Mint amount must be greater than 0.";
        status.className = "error";
        return;
    }

    try {
        const tokenContract = new web3.eth.Contract(mintonTokenABI, tokenAddress);
        const mintAmountWei = web3.utils.toWei(mintAmount, "ether");
        const mintFee = web3.utils.toWei("10", "ether");
        const gasPrice = await web3.eth.getGasPrice();

        status.textContent = "Minting tokens...";
        const tx = await tokenContract.methods
            .mint(accounts[0], mintAmountWei)
            .send({
                from: accounts[0],
                value: mintFee,
                gas: 2000000,
                gasPrice: gasPrice
            });

        const userAmount = web3.utils.fromWei(tx.events.MintWithFee.returnValues.userAmount, "ether");
        const feeAmount = web3.utils.fromWei(tx.events.MintWithFee.returnValues.feeAmount, "ether");
        status.textContent = `Minted ${userAmount} tokens to ${accounts[0]}. Fee: ${feeAmount} tokens to ${tx.events.MintWithFee.returnValues.feeCollectorAddr}`;
        status.className = "";
    } catch (error) {
        status.textContent = `Minting failed: ${error.message}`;
        status.className = "error";
        console.error("Minting Error:", error);
    }
});

// Check network on load
window.addEventListener("load", async () => {
    if (window.ethereum) {
        const chainId = await web3.eth.getChainId();
        if (chainId !== 8082) { // Updated to Shardeum Unstable Testnet Chain ID
            status.textContent = "Please switch to Shardeum Unstable Testnet (Chain ID: 8082) in MetaMask!";
            status.className = "error";
        } else {
            status.textContent = "Ready. Connect MetaMask to proceed.";
            status.className = "";
        }
    } else {
        status.textContent = "MetaMask not detected. Please install it.";
        status.className = "error";
    }
});