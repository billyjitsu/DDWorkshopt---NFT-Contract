const hre = require("hardhat");

async function main() {

  //variables
  const URI = "https://nfbeez.mypinata.cloud/ipfs/QmbAAXHfx5djDKbN7MHzApjyiBHeTv5LRJHsN9S7zy5aUZ/1.json";

  const Web3 = await hre.ethers.getContractFactory("DDNFT");
  const web3 = await Web3.deploy(URI);

  await web3.deployed();

  console.log("DDNFT Contract deployed to:", web3.address);
  const receipt = await web3.deployTransaction.wait();
  console.log("gasUsed:" , receipt.gasUsed);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
