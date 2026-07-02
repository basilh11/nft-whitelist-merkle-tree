// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleNFT is ERC721, Ownable {

    bytes32 public merkleRoot;
    uint256 private _tokenIdCounter;
    mapping(address => bool) public hasMinted;

    constructor(bytes32 _merkleRoot)
        ERC721("MerkleNFT", "MNFT")
        Ownable(msg.sender)
    {
        merkleRoot = _merkleRoot;
    }

    function whitelistMint(bytes32[] calldata proof) external {
        require(!hasMinted[msg.sender], "Already minted");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Not whitelisted");
        hasMinted[msg.sender] = true;
        _safeMint(msg.sender, _tokenIdCounter++);
    }

    function isWhitelisted(address addr, bytes32[] calldata proof)
        public view returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(addr));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
}