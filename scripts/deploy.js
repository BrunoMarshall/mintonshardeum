const hre = require("hardhat");

async function main() {
  const MintonFactory = await hre.ethers.getContractFactory("MintonFactory");
  const factory = await MintonFactory.deploy();
  await factory.deployed();
  console.log("MintonFactory deployed to:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});