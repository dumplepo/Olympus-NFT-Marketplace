let selectedTokenId = null;

// =======================
// PINATA CONFIG
// =======================
const PINATA_API_KEY = "e4b47f7a45965efc2def";
const PINATA_SECRET_API_KEY = "e8daf82a90bfa39d751ad2e88bf7e1a8d12560883af983a3fc91abfdd2e505e5";

// ----------------------
// Helpers
// ----------------------
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "flex";
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

function ipfsToHttp(uri) {
  return uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
}

// =======================
// Pinata Uploads
// =======================
async function uploadToPinata(file) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY
    },
    body: formData
  });

  if (!res.ok) throw new Error("Image upload failed");

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

async function uploadMetadataToPinata(metadata) {
  const res = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY
      },
      body: JSON.stringify(metadata)
    }
  );

  if (!res.ok) throw new Error("Metadata upload failed");

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}


// ----------------------
// Render NFTs
// ----------------------
async function renderCollections() {
  if (!contract || !userAddress) return;

  const marketplace = document.getElementById("marketplace");
  const myNfts = document.getElementById("myNfts");

  marketplace.innerHTML = "";
  myNfts.innerHTML = "";

  const items = await getCollection();

  for (const item of items) {
    const tokenId = item[0].toNumber();
    const owner = item[1];
    const price = item[2];
    const forSale = item[3];

    // 🔹 Fetch metadata
    const uri = await contract.tokenURI(tokenId);
    const metaRes = await fetch(ipfsToHttp(uri));
    const meta = await metaRes.json();

    const card = document.createElement("div");
    card.className = "nft";

    card.innerHTML = `
      <img src="${ipfsToHttp(meta.image)}" width="200">
      <h3>${meta.name}</h3>
      <p>${meta.description}</p>
      <p>ID: ${tokenId}</p>
      <p>${forSale ? ethers.utils.formatEther(price) + " ETH" : "Not for sale"}</p>
    `;

    // Buy
    if (forSale && owner.toLowerCase() !== userAddress.toLowerCase()) {
      const buyBtn = document.createElement("button");
      buyBtn.innerText = "Buy";
      buyBtn.onclick = async () => {
        await buyNFT(tokenId, price);
        renderCollections();
      };
      card.appendChild(buyBtn);
      marketplace.appendChild(card);
    }

    // Sell
    if (owner.toLowerCase() === userAddress.toLowerCase()) {
      const sellBtn = document.createElement("button");
      sellBtn.innerText = "Sell";
      sellBtn.onclick = () => openSellModal(tokenId);
      card.appendChild(sellBtn);
      myNfts.appendChild(card);
    }
  }
}

// ----------------------
// Mint modal logic
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectWallet");
  const openMintBtn = document.getElementById("openMint");
  const mintBtn = document.getElementById("confirmMintBtn");
  const imageInput = document.getElementById("mintImage");
  const preview = document.getElementById("imagePreview");
  const nameInput = document.getElementById("mintName");
  const descInput = document.getElementById("mintDesc");

  connectBtn.onclick = async () => {
    await connectWallet();
    openMintBtn.disabled = false;
    renderCollections();
  };

  openMintBtn.onclick = () => openModal("mintModal");

  imageInput.onchange = () => {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  };

  mintBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const file = imageInput.files[0];

    if (!name || !desc || !file) return alert("Fill all fields");

    try {
      const imageURI = await uploadToPinata(file);
      const metadataURI = await uploadMetadataToPinata({
        name,
        description: desc,
        image: imageURI
      });

      await mintNFT(metadataURI);

      closeModal("mintModal");
      renderCollections();
    } catch (err) {
      console.error(err);
      alert("Mint failed");
    }
  };
});

// ----------------------
// Sell modal
// ----------------------
function openSellModal(tokenId) {
  selectedTokenId = tokenId;
  openModal("sellModal");

  document.getElementById("confirmSellBtn").onclick = async () => {
    const price = document.getElementById("sellPrice").value;
    await sellNFT(selectedTokenId, price);
    closeModal("sellModal");
    renderCollections();
  };
}
