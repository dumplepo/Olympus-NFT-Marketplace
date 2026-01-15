document.addEventListener("DOMContentLoaded", () => {

  /* =======================
     ELEMENT REFERENCES
  ======================= */
  const connectBtn = document.getElementById("connectWallet");
  const openMintBtn = document.getElementById("openMint");
  const mintModal = document.getElementById("mintModal");

  const imageInput = document.getElementById("mintImage");
  const preview = document.getElementById("imagePreview");
  const mintBtn = document.getElementById("confirmMintBtn");

  const nameInput = document.getElementById("mintName");
  const descInput = document.getElementById("mintDesc");

  /* =======================
     SAFETY CHECKS
  ======================= */
  if (!connectBtn || !openMintBtn || !mintModal) {
    console.error("Critical DOM elements missing");
    return;
  }

  /* =======================
     INITIAL STATE
  ======================= */
  openMintBtn.disabled = true;

  /* =======================
     WALLET CONNECTION
  ======================= */
  connectBtn.onclick = async () => {
    await connectWallet();
    // openMintBtn.disabled = false;
  };

  /* =======================
     OPEN MINT MODAL
  ======================= */
  openMintBtn.onclick = () => {
    mintModal.style.display = "flex";
  };

/* =======================
   IMAGE PREVIEW
======================= */
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";

    // 🔹 Resize preview
    preview.style.width = "150px";   // width of the preview NFT
    preview.style.height = "150px";  // keep square
    preview.style.objectFit = "cover"; // crop if needed
    preview.style.borderRadius = "10px"; // match NFT card style
  };
  reader.readAsDataURL(file);
});


  /* =======================
     CONFIRM MINT
  ======================= */
  mintBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const file = imageInput.files[0];

    if (!name || !desc || !file) {
      alert("⚠️ Please fill all fields and select an image");
      return;
    }

    try {
      // Convert image → Base64
      const imageBase64 = await resizeImage(file);

      // Build metadata
      const metadata = {
        name,
        description: desc,
        image: imageBase64
      };

      // Encode metadata → tokenURI
      const tokenURI =
        "data:application/json;base64," +
        btoa(JSON.stringify(metadata));

      await mintNFT(tokenURI);

      // Reset modal
      nameInput.value = "";
      descInput.value = "";
      imageInput.value = "";
      preview.style.display = "none";

      closeModal("mintModal");
      renderCollections();

    } catch (err) {
      console.error("Mint failed:", err);
      alert("Mint failed. See console.");
    }
  };

  function resizeImage(file, maxWidth = 200, maxHeight = 200) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    reader.readAsDataURL(file);
  });
}


});

/* =======================
   HELPERS
======================= */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =======================
   MODAL CONTROL
======================= */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

