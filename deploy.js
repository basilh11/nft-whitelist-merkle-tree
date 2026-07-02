require("dotenv").config();
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

async function main() {
  // Whitelist of addresses allowed to mint
  const whitelist = [
    "0x52D627c4E31d8795080959bD934A3622a3bBADC9", // Basil
    "0x03e69b5d28ba10AA20b441469523399b1f6200f5", // Ali 
  ];

  // Build Merkle Tree
  const leaves = whitelist.map((addr) =>
    keccak256(Buffer.from(addr.replace("0x", ""), "hex"))
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  console.log("Deploying MerkleNFT...");
  console.log("Merkle Root:", root);

  const MerkleNFT = await ethers.getContractFactory("MerkleNFT");
  const contract = await MerkleNFT.deploy(root);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("MerkleNFT deployed to:", address);
  console.log("\nSave this contract address — you will need it!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});