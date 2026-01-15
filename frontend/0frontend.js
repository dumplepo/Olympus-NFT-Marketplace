
// ===============================
// UI Layer (NO blockchain logic)
// ===============================

const connectBtn = document.getElementById("connectWallet");
const openMintBtn = document.getElementById("openMint");
const mintModal = document.getElementById("mintModal");
const closeMintBtn = document.getElementById("closeMint");
const confirmMintBtn = document.getElementById("confirmMint");

openMintBtn.disabled = true;

// -------------------------------
// Enable Mint after wallet connect
// -------------------------------
connectBtn.onclick = async () => {
  await connectWallet();
  openMintBtn.disabled = false;
};


// -------------------------------
// Modal Controls
// -------------------------------
openMintBtn.onclick = () => {
  console.log("Mint button clicked");
  mintModal.style.display = "flex";
};


closeMintBtn.onclick = () => {
  mintModal.style.display = "none";
};

// -------------------------------
// Mint NFT (image-based UX)
// -------------------------------
confirmMintBtn.onclick = async () => {
  if (!contract) {
    alert("Connect wallet first");
    return;
  }

  const name = document.getElementById("mintName").value;
  const desc = document.getElementById("mintDesc").value;
  const file = document.getElementById("mintImage").files[0];

  if (!name || !desc || !file) {
    alert("Fill all fields");
    return;
  }

  // Temporary local image URL (Step 5 → IPFS)
  const imageURL = URL.createObjectURL(file);

  console.log("Minting NFT:", { name, desc, imageURL });

  // Contract still requires tokenURI (placeholder)
  await mintNFT("LOCAL_METADATA");

  alert("NFT Minted!");

  mintModal.style.display = "none";

  // Reset form
  document.getElementById("mintName").value = "";
  document.getElementById("mintDesc").value = "";
  document.getElementById("mintImage").value = "";
};
