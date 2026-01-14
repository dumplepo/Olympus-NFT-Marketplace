let selectedTokenId = null;

const gods = {
  1: { name: "Zeus ⚡", img: "img/zeus.png" },
  2: { name: "Hades 🔥", img: "img/hades.png" },
  3: { name: "Poseidon 🌊", img: "img/poseidon.png" }
};

/* MODAL CONTROLS */
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

/* MINT */
document.getElementById("openMint").onclick = () => openModal("mintModal");

async function confirmMint() {
  const uri = document.getElementById("tokenURI").value;
  await mintNFT(uri);
  closeModal("mintModal");
  renderCollections();
}

/* SELL */
function openSell(tokenId) {
  selectedTokenId = tokenId;
  openModal("sellModal");
}

async function confirmSell() {
  const price = document.getElementById("sellPrice").value;
  await sellNFT(selectedTokenId, price);
  closeModal("sellModal");
  renderCollections();
}

/* RENDER */
async function renderCollections() {
  if (!contract || !userAddress) return;

  const market = document.getElementById("marketplace");
  const mine = document.getElementById("myNfts");

  market.innerHTML = "";
  mine.innerHTML = "";

  const items = await getCollection();

  items.forEach(item => {
    const tokenId = item[0];
    const owner = item[1];
    const price = item[2];
    const forSale = item[3];

    const god = gods[tokenId] || { name: "Unknown", img: "img/nft.png" };

    const card = document.createElement("div");
    card.className = "nft";

    card.innerHTML = `
      <img src="${god.img}">
      <h3>${god.name}</h3>
      <p>ID: ${tokenId}</p>
      <p>${forSale ? ethers.utils.formatEther(price) + " ETH" : "Not for sale"}</p>
    `;

    if (forSale && owner.toLowerCase() !== userAddress.toLowerCase()) {
      const buy = document.createElement("button");
      buy.innerText = "Buy";
      buy.onclick = async () => {
        await buyNFT(tokenId, price);
        renderCollections();
      };
      card.appendChild(buy);
      market.appendChild(card);
    }

    if (owner.toLowerCase() === userAddress.toLowerCase()) {
      const sell = document.createElement("button");
      sell.innerText = "Sell";
      sell.onclick = () => openSell(tokenId);
      card.appendChild(sell);
      mine.appendChild(card);
    }
  });
}

/* WALLET */
document.getElementById("connectWallet").onclick = async () => {
  await connectWallet();
  document.getElementById("walletAddress").innerText =
    "🟢 Connected: " + userAddress.slice(0,6) + "...";
  renderCollections();
};
