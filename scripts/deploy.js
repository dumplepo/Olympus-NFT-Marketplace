const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const MythNFT = await hre.ethers.getContractFactory("MythNFT");
  const mythNFT = await MythNFT.deploy();

  await mythNFT.waitForDeployment();

  console.log("MythNFT deployed to:", await mythNFT.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
