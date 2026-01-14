const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MythNFT = await hre.ethers.getContractFactory("MythNFT");
  const mythNFT = await MythNFT.deploy();

  // ✅ ethers v6 fix
  await mythNFT.waitForDeployment();

  const address = await mythNFT.getAddress();
  console.log("MythNFT deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
