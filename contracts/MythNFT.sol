// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MythNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 1;

    struct NFTItem {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => NFTItem) public nftList;

    constructor() ERC721("MythNFT", "MYTH") Ownable(msg.sender) {}

    function mint(string memory tokenURI) external {
        uint256 tokenId = nextTokenId;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftList[tokenId] = NFTItem({
            tokenId: tokenId,
            owner: msg.sender,
            price: 0,
            forSale: false
        });

        nextTokenId++;
    }

    function sell(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        nftList[tokenId].price = price;
        nftList[tokenId].forSale = true;
    }

    function buy(uint256 tokenId) external payable {
        NFTItem storage item = nftList[tokenId];

        require(item.forSale, "Not for sale");
        require(msg.value >= item.price, "Insufficient ETH");
        require(item.owner != msg.sender, "Cannot buy your own NFT");

        address seller = item.owner;

        _transfer(seller, msg.sender, tokenId);

        item.owner = msg.sender;
        item.forSale = false;
        item.price = 0;

        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "ETH transfer failed");
    }

    function getCollection() external view returns (NFTItem[] memory) {
        NFTItem[] memory items = new NFTItem[](nextTokenId - 1);

        for (uint256 i = 1; i < nextTokenId; i++) {
            items[i - 1] = nftList[i];
        }

        return items;
    }
}
