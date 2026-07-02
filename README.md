NFT Whitelist — Merkle Tree Verification

A gas-efficient NFT whitelist and minting system built on Ethereum, using Merkle trees to verify whitelist membership without storing the full address list on-chain. Deployed and verified on the Sepolia testnet. Built for a Digital Finance and Blockchain Technologies course project.

Contributors: Muhammad Basil Haq, Mahd Naeem, Ali Maqsood

Live Deployment


Contract Address: 0x1Cf86198cf845096d68F52e2752b699222CbF4d3
Network: Sepolia testnet
Status: Source code verified on Etherscan (Similar Match) — bytecode, ABI, and contract interaction tabs are publicly accessible
Merkle Root: 0x49cf93dbf154c62b80521a3fe7a0278763cb4100b81a6ff513a2e90aac976db4


The Problem

Storing an entire whitelist on-chain doesn't scale — each address costs roughly 20,000 gas to store, so a 1,000-address whitelist would cost around 20,000,000 gas. This project solves that by storing only a single 32-byte Merkle root on-chain, regardless of whitelist size. To mint, a user submits a short cryptographic proof; the contract recomputes the root from that proof and checks it matches — no per-address storage required.

How It Works


Off-chain tree generation (generateMerkle.js) — hashes each whitelisted address with keccak256, builds a Merkle tree (via merkletreejs, with sortPairs enabled for OpenZeppelin compatibility), and generates a proof for every address, saved to merkle-data.json.
On-chain verification (MerkleNFT.sol) — the contract stores only the Merkle root. To mint, a user submits their proof; the contract hashes msg.sender, recomputes the root via OpenZeppelin's MerkleProof.verify(), and mints only if it matches.
Frontend (index.html) — connects via MetaMask and ethers.js, calls isWhitelisted() to check status, and shows an enabled "Mint NFT" button only for verified addresses.


Smart Contract

MerkleNFT.sol inherits OpenZeppelin's ERC721 and Ownable, and exposes four core functions:


constructor(bytes32 _merkleRoot) — sets the NFT name/symbol and stores the initial Merkle root at deployment.
whitelistMint(bytes32[] calldata proof) — the main minting function. Rejects addresses that already minted, hashes msg.sender as the leaf (so proofs can't be copied and reused by other addresses), and verifies against the stored root before minting.
isWhitelisted(address addr, bytes32[] calldata proof) — a free view function the frontend uses to check whitelist status before a user attempts to mint.
setMerkleRoot(bytes32 _merkleRoot) — lets the contract owner update the whitelist after deployment, protected by onlyOwner.


Testing

8 unit tests written with Mocha and Chai, run via npx hardhat test — all passing:


Valid whitelist minting
Rejection of non-whitelisted addresses
Duplicate mint prevention
Tampered proof rejection
Wrong-address proof rejection
isWhitelisted() validation
Owner-only setMerkleRoot() access control


Tech Stack

Solidity 0.8.28 · Hardhat · OpenZeppelin Contracts · merkletreejs · ethers.js · MetaMask · Mocha / Chai

Setup

bashnpm install
npx hardhat compile
npx hardhat test
node scripts/generateMerkle.js
npx hardhat run scripts/deploy.js --network sepolia

Requires a .env file (not included) with SEPOLIA_RPC_URL, PRIVATE_KEY, and ETHERSCAN_API_KEY.

Trade-offs

Storing only the root keeps gas costs flat regardless of whitelist size, but it comes with real trade-offs: updating the whitelist means rebuilding the entire tree and pushing a new root on-chain, proof generation depends on an off-chain service staying available, and the immutable nature of deployed contracts means any bug requires a full redeployment rather than a patch.
