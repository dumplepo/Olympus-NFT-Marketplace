// UI layer
const nftImages = {
    1: "img/zeus.png",
    2: "img/hades.png",
    3: "img/poseidon.png"
};

async function renderCollections() {
    if (!contract || !userAddress) return;

    const marketDiv = document.getElementById("marketplace");
    const myDiv = document.getElementById("myNfts");

    marketDiv.innerHTML = "";
    myDiv.innerHTML = "";

    const items = await getCollection();

    items.forEach(item => {
        const tokenId = item[0];
        const owner = item[1];
        const price = item[2];
        const forSale = item[3];

        const card = document.createElement("div");
        card.className = "nft";

        card.innerHTML = `
            <img src="${nftImages[tokenId] || 'img/nft.png'}">
            <p>ID: ${tokenId}</p>
            <p>Owner: ${owner.slice(0,6)}...</p>
            <p>Price: ${forSale ? ethers.utils.formatEther(price) + ' ETH' : 'Not for sale'}</p>
            <p>For Sale: ${forSale}</p>
        `;

        if (forSale && owner.toLowerCase() !== userAddress.toLowerCase()) {
            const buyBtn = document.createElement("button");
            buyBtn.innerText = "Buy";
            buyBtn.onclick = () => buyNFT(tokenId, price).then(renderCollections);
            card.appendChild(buyBtn);
            marketDiv.appendChild(card);
        }

        if (owner.toLowerCase() === userAddress.toLowerCase()) {
            const input = document.createElement("input");
            input.id = `price${tokenId}`;
            input.placeholder = "Price in ETH";

            const sellBtn = document.createElement("button");
            sellBtn.innerText = "Sell";
            sellBtn.onclick = () => sellNFT(tokenId, document.getElementById(`price${tokenId}`).value).then(renderCollections);

            card.appendChild(input);
            card.appendChild(sellBtn);
            myDiv.appendChild(card);
        }
    });
}

document.getElementById("connectWallet").onclick = async () => {
    await connectWallet();
    document.getElementById("walletAddress").innerText = "Connected: " + userAddress;
    renderCollections();
};

document.getElementById("mintNFT").onclick = async () => {
    const tokenURI = document.getElementById("tokenURI").value;
    await mintNFT(tokenURI);
    renderCollections();
};
