// Contract interaction layer
let provider;
let signer;
let userAddress;
let contract;

// Replace with deployed address from Hardhat
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contractABI = [
  "function mint(string tokenURI)",
  "function sell(uint256 tokenId, uint256 price)",
  "function buy(uint256 tokenId) payable",
  "function getCollection() view returns (tuple(uint256,address,uint256,bool)[])"
];

async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
}

async function mintNFT(tokenURI) {
    const tx = await contract.mint(tokenURI);
    await tx.wait();
}

async function sellNFT(tokenId, priceInEth) {
    const price = ethers.utils.parseEther(priceInEth);
    const tx = await contract.sell(tokenId, price);
    await tx.wait();
}

async function buyNFT(tokenId, price) {
    const tx = await contract.buy(tokenId, { value: price });
    await tx.wait();
}

async function getCollection() {
    return await contract.getCollection();
}
