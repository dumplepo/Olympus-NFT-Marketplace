const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MythNFT = await ethers.getContractFactory("MythNFT");
  const mythNFT = await MythNFT.deploy(); // already deployed

  console.log("MythNFT deployed to:", mythNFT.target); // v6 uses .target, not .address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
