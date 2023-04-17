const hre = require("hardhat");

async function main() {
  const AlphaToken = await hre.ethers.getContractFactory("AlphaToken"); //to get instance of our AlphaToken contract
  const alphaToken = await AlphaToken.deploy(100000000, 50); //to deploy Token contract and capturing its instance

  await alphaToken.deployed(); //wait for deployment of the contract

  console.log("Alpha Token deployed: ", alphaToken.address); //accessing address of our deployed
  //contract using the instance of it
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
