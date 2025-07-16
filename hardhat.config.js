require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    shardeum: {
      url: "https://api-testnet.shardeum.org", // Updated RPC URL
      chainId: 8083, // Updated Chain ID
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};