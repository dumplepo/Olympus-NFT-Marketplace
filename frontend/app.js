// ===============================
// Web3 Base Layer
// ===============================

let provider;
let signer;
let userAddress;
let contract;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contractABI = [
    "function mint(string tokenURI)",
    "function sell(uint256 tokenId, uint256 price)",
    "function buy(uint256 tokenId) payable",
    "function getCollection() view returns (tuple(uint256,address,uint256,bool)[])",
    "function tokenURI(uint256 tokenId) view returns (string)"
  ];

// -------------------------------
// Connect Wallet
// -------------------------------
async function connectWallet() {
  if (!window.ethereum) return alert("Please install MetaMask");

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  contract = new ethers.Contract(contractAddress, contractABI, signer);

  document.getElementById("walletAddress").innerText =
    "🟢 Connected: " + userAddress.slice(0, 6) + "...";

  document.getElementById("status").innerText = "Wallet connected. Contract ready.";

  console.log("Wallet connected:", userAddress);
}

// -------------------------------
// Mint NFT
// -------------------------------
async function mintNFT(tokenURI) {
  if (!contract) return alert("Contract not ready");

  try {
    // ✅ Increase gas for tiny image
    const tx = await contract.mint(tokenURI, { gasLimit: 500_000 });
    await tx.wait();
    console.log("Minted:", tx);
  } catch (err) {
    console.error("Mint failed:", err);
    alert("Mint failed. Check console.");
  }
}

// -------------------------------
// Sell NFT
// -------------------------------
async function sellNFT(tokenId, priceEth) {
  const price = ethers.utils.parseEther(priceEth);
  const tx = await contract.sell(tokenId, price);
  await tx.wait();
}

// -------------------------------
// Buy NFT
// -------------------------------
async function buyNFT(tokenId, price) {
  const tx = await contract.buy(tokenId, { value: price });
  await tx.wait();
}

// -------------------------------
// Get all NFTs
// -------------------------------
async function getCollection() {
  return await contract.getCollection();
}
