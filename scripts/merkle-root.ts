import { ethers } from "hardhat";
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeMerkleLeaf(address: any, spots: number) {
    return ethers.utils.defaultAbiCoder.encode(
        ["address", 'uint64'],
        [address, spots]
    )
}

async function main() {
    const [owner, addressOne, addressTwo, addressThree] = 
    await ethers.getSigners();

    const addressList = [
        encodeMerkleLeaf(owner.address, 2),
        encodeMerkleLeaf(addressOne.address, 2),
        encodeMerkleLeaf(addressTwo.address, 3),
        encodeMerkleLeaf(addressThree.address, 4),
    ];

    const merkleTree = new MerkleTree(addressList, keccak256, {
        hashleaves: true,
        sortPairs: true,
    });

    const ancodeMerkleRoot = merkleTree.getHexRoot();

    console.log("Merkle Tree: ", merkleTree.toString());
    console.log("Merkle Root: ", ancodeMerkleRoot);


    const whitelist = await ethers.getContractFactory("MerkleTree");
    const Whitelist = await whitelist.deploy(ancodeMerkleRoot);
    await Whitelist.deployed();

    const leaf = keccak256(addressList[0]);
    const proof = merkleTree.getHexProof(leaf);

    let verifiedList = await Whitelist.checkInWhitelist(proof, 4);
    console.log("VERIFIED LIST: ", verifiedList);






    
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
