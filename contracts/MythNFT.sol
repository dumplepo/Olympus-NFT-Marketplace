// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MythNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCount; // track minted NFTs

    struct NFTItem {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => NFTItem) public nftList; // all NFTs

    constructor() ERC721("GreekMythNFT", "GMNFT") Ownable(msg.sender) {}

    // Mint NFT
    function mint(string memory tokenURI) public {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, tokenURI);

        nftList[tokenCount] = NFTItem({
            tokenId: tokenCount,
            owner: msg.sender,
            price: 0,
            forSale: false
        });
    }

    // Put NFT for sale
    function sell(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        nftList[tokenId].price = price;
        nftList[tokenId].forSale = true;
    }

    // Buy NFT
    function buy(uint256 tokenId) public payable {
        NFTItem storage item = nftList[tokenId];
        require(item.forSale, "Not for sale");
        require(msg.value >= item.price, "Insufficient ETH");

        address oldOwner = ownerOf(tokenId);
        _transfer(oldOwner, msg.sender, tokenId);

        (bool sent, ) = oldOwner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        item.owner = msg.sender;
        item.forSale = false;
    }

    // Show collection of NFTs
    function getCollection() public view returns (NFTItem[] memory) {
        NFTItem[] memory collection = new NFTItem[](tokenCount);
        for (uint256 i = 1; i <= tokenCount; i++) {
            collection[i-1] = nftList[i];
        }
        return collection;
    }
}
