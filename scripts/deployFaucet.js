const hre = require("hardhat");

async function main() {
  const Faucet = await hre.ethers.getContractFactory("FaucetAlphaToken"); //to get instance of our FaucetAlphaToken contract
  const faucet = await Faucet.deploy(
    "0x597875AfdF804313E6e6B4100227335c8480Cd25" //this is the address of the deployed AlphaToken on mumbai network
  );
  //to deploy Faucet contract and capturing its instance

  await faucet.deployed(); //wait for deployment of the Faucet contract

  console.log("Facuet contract deployed: ", faucet.address);
  //accessing address of our deployed contract using the instance of it
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
