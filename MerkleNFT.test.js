const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MerkleNFT", function () {
  let contract, owner, addr1, addr2, addr3, notWhitelisted;
  let tree, root;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, notWhitelisted] = await ethers.getSigners();

    // Build whitelist from test addresses
    const whitelist = [addr1.address, addr2.address, addr3.address];

    const leaves = whitelist.map((addr) =>
      keccak256(Buffer.from(addr.replace("0x", ""), "hex"))
    );

    tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    root = tree.getHexRoot();

    // Deploy contract with the merkle root
    const MerkleNFT = await ethers.getContractFactory("MerkleNFT");
    contract = await MerkleNFT.deploy(root);
  });

  // Helper to get proof for an address
  function getProof(addr) {
    const leaf = keccak256(Buffer.from(addr.replace("0x", ""), "hex"));
    return tree.getHexProof(leaf);
  }

  it("Should mint successfully for a whitelisted address", async function () {
    const proof = getProof(addr1.address);
    await contract.connect(addr1).whitelistMint(proof);
    expect(await contract.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should reject a non-whitelisted address", async function () {
    const proof = getProof(notWhitelisted.address);
    await expect(
      contract.connect(notWhitelisted).whitelistMint(proof)
    ).to.be.revertedWith("Not whitelisted");
  });

  it("Should prevent minting twice", async function () {
    const proof = getProof(addr1.address);
    await contract.connect(addr1).whitelistMint(proof);
    await expect(
      contract.connect(addr1).whitelistMint(proof)
    ).to.be.revertedWith("Already minted");
  });

  it("Should reject a tampered proof", async function () {
    const proof = getProof(addr1.address);
    // Use addr2's proof but try to mint as addr1
    const wrongProof = getProof(addr2.address);
    await expect(
      contract.connect(addr1).whitelistMint(wrongProof)
    ).to.be.revertedWith("Not whitelisted");
  });

  it("Should return true for isWhitelisted on valid address", async function () {
    const proof = getProof(addr2.address);
    expect(await contract.isWhitelisted(addr2.address, proof)).to.equal(true);
  });

  it("Should return false for isWhitelisted on invalid address", async function () {
    const proof = getProof(notWhitelisted.address);
    expect(
      await contract.isWhitelisted(notWhitelisted.address, proof)
    ).to.equal(false);
  });

  it("Should allow owner to update merkle root", async function () {
    const newRoot = ethers.ZeroHash;
    await contract.connect(owner).setMerkleRoot(newRoot);
    expect(await contract.merkleRoot()).to.equal(newRoot);
  });

  it("Should reject non-owner trying to update merkle root", async function () {
    const newRoot = ethers.ZeroHash;
    await expect(
      contract.connect(addr1).setMerkleRoot(newRoot)
    ).to.be.reverted;
  });
});