let selectedTokenId = null;

/* Frontend metadata store */
const nftMeta = {};

/* MODAL */
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

/* MINT */
document.getElementById("openMint").onclick = () => openModal("mintModal");

async function confirmMint() {
  const name = mintName.value;
  const desc = mintDesc.value;
  const file = mintImage.files[0];

  if (!name || !desc || !file) return alert("Fill all fields");

  const imgURL = URL.createObjectURL(file);

  await mintNFT("local");

  const items = await getCollection();
  const tokenId = items.length;

  nftMeta[tokenId] = { name, desc, img: imgURL };

  closeModal("mintModal");
  renderCollections();
}

/* SELL */
function openSell(tokenId) {
  selectedTokenId = tokenId;
  openModal("sellModal");
}

async function confirmSell() {
  await sellNFT(selectedTokenId, sellPrice.value);
  closeModal("sellModal");
  renderCollections();
}

/* DETAIL */
function openDetail(item) {
  const [id, owner, price, forSale] = item;
  const meta = nftMeta[id] || { name:"NFT", desc:"No description", img:"img/nft.png" };

  detailImage.src = meta.img;
  detailName.innerText = meta.name;
  detailId.innerText = id;
  detailOwner.innerText = owner;
  detailDesc.innerText = meta.desc;
  detailPrice.innerText = forSale ? ethers.utils.formatEther(price)+" ETH" : "Not for sale";

  detailActions.innerHTML = "";

  if (forSale && owner.toLowerCase() !== userAddress.toLowerCase()) {
    const buy = document.createElement("button");
    buy.innerText = "Buy";
    buy.onclick = async () => {
      await buyNFT(id, price);
      closeModal("detailModal");
      renderCollections();
    };
    detailActions.appendChild(buy);
  }

  if (owner.toLowerCase() === userAddress.toLowerCase()) {
    const sell = document.createElement("button");
    sell.innerText = "Sell";
    sell.onclick = () => openSell(id);
    detailActions.appendChild(sell);
  }

  openModal("detailModal");
}

/* RENDER */
async function renderCollections() {
  marketplace.innerHTML = "";
  myNfts.innerHTML = "";

  const items = await getCollection();

  items.forEach(item => {
    const [id, owner] = item;
    const meta = nftMeta[id] || { name:"NFT", img:"img/nft.png" };

    const card = document.createElement("div");
    card.className = "nft";
    card.onclick = () => openDetail(item);

    card.innerHTML = `<img src="${meta.img}"><h3>${meta.name}</h3><p>ID #${id}</p>`;

    owner.toLowerCase() === userAddress.toLowerCase()
      ? myNfts.appendChild(card)
      : marketplace.appendChild(card);
  });
}

/* WALLET */
connectWallet.onclick = async () => {
  await connectWallet();
  walletAddress.innerText = "🟢 " + userAddress.slice(0,6) + "...";
  renderCollections();
};
