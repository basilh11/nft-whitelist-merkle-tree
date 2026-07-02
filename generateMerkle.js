const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");

// List of whitelisted addresses - we will use these for testing
const whitelist = [
  "0x52D627c4E31d8795080959bD934A3622a3bBADC9", // Basil
  "0x03e69b5d28ba10AA20b441469523399b1f6200f5", // Ali
];

// Hash each address to create the leaves
const leaves = whitelist.map((addr) =>
  keccak256(Buffer.from(addr.replace("0x", ""), "hex"))
);

// Build the Merkle Tree
const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get the root
const root = tree.getHexRoot();

console.log("Merkle Root:", root);
console.log("\nProofs for each address:");

// Generate and display proof for each address
const proofs = {};
whitelist.forEach((addr, i) => {
  const proof = tree.getHexProof(leaves[i]);
  proofs[addr] = proof;
  console.log(`\n${addr}`);
  console.log("Proof:", proof);
});

// Save everything to a file
const output = { root, proofs };
fs.writeFileSync("merkle-data.json", JSON.stringify(output, null, 2));
console.log("\nSaved to merkle-data.json");