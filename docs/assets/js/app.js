// Web3.js integration for MetaMask and Shardeum
const Web3 = window.Web3;
let web3;
let contract;
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with deployed contract address
const contractABI = [
    // Paste the ABI from Remix after deploying the contract
    // Example ABI structure (simplified):
    [
        {
            "inputs": [
                {"internalType": "string", "name": "name", "type": "string"},
                {"internalType": "string", "name": "symbol", "type": "string"},
                {"internalType": "uint256", "name": "initialSupply", "type": "uint256"},
                {"internalType": "uint256", "name": "_maxSupply", "type": "uint256"},
                {"internalType": "bool", "name": "_mintable", "type": "bool"}
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        // Add the rest of the ABI here
    ]
];

const testnetConfig = {
    networkName: "Shardeum Testnet",
    rpcUrl: "https://api-testnet.shardeum.org",
    chainId: "8083",
    explorerUrl: "https://explorer-testnet.shardeum.org"
};

const mainnetConfig = {
    networkName: "Shardeum",
    rpcUrl: "https://api.shardeum.org",
    chainId: "8118",
    explorerUrl: "https://explorer.shardeum.org"
};

async function connectMetaMask() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3.eth.getAccounts();
            document.getElementById("connect-metamask").innerText = `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
            return accounts[0];
        } catch (error) {
            console.error("MetaMask connection failed:", error);
            document.getElementById("status").innerText = "Failed to connect MetaMask";
        }
    } else {
        document.getElementById("status").innerText = "Please install MetaMask";
    }
}

async function switchNetwork(network) {
    const config = network === "testnet" ? testnetConfig : mainnetConfig;
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${parseInt(config.chainId).toString(16)}` }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: `0x${parseInt(config.chainId).toString(16)}`,
                    chainName: config.networkName,
                    rpcUrls: [config.rpcUrl],
                    blockExplorerUrls: [config.explorerUrl],
                    nativeCurrency: { name: "SHM", symbol: "SHM", decimals: 18 }
                }],
            });
        } else {
            throw switchError;
        }
    }
}

document.getElementById("connect-metamask").addEventListener("click", connectMetaMask);

document.getElementById("token-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("status");
    status.innerText = "Processing...";

    const tokenName = document.getElementById("token-name").value;
    const tokenSymbol = document.getElementById("token-symbol").value;
    const initialSupply = document.getElementById("initial-supply").value;
    const maxSupply = document.getElementById("max-supply").value;
    const decimals = document.getElementById("decimals").value;
    const mintable = document.getElementById("mintable").checked;
    const network = document.getElementById("network").value;

    // Input validation to prevent injection
    if (!/^[A-Za-z0-9\s]+$/.test(tokenName) || !/^[A-Za-z0-9]+$/.test(tokenSymbol)) {
        status.innerText = "Invalid input: Use alphanumeric characters only";
        return;
    }

    try {
        await switchNetwork(network);
        const accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(contractABI, contractAddress);

        const initialSupplyWei = web3.utils.toWei(initialSupply, "ether");
        const maxSupplyWei = web3.utils.toWei(maxSupply, "ether");

        await contract.methods
            .mint(accounts[0], initialSupplyWei)
            .send({ from: accounts[0], value: web3.utils.toWei("10", "ether") });

        status.innerText = `Token ${tokenName} (${tokenSymbol}) minted successfully!`;
    } catch (error) {
        console.error("Minting failed:", error);
        status.innerText = "Minting failed: " + error.message;
    }
});