const { expect } = require("chai"); //test assertion imported from chai
const hre = require("hardhat"); //hre(hardhat runtime environment) contains ethers.js library
//which is added to interact with  our smart contract

describe("AlphaToken contract", function () {
  // global vars
  let Token; //to represent our Token
  let alphaToken; //to represent instance of our token
  let owner; //to store address taken from hardhat using hre.ethers
  let addr1; //to store address taken from hardhat using hre.ethers
  let addr2; //to store address taken from hardhat using hre.ethers
  let tokenCap = 100000000; //constructor arg for Token contract
  let tokenBlockReward = 50; //constructor arg for Token contract

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await hre.ethers.getContractFactory("AlphaToken"); //to get instance of Token contract using ethers taken from hre
    [owner, addr1, addr2] = await hre.ethers.getSigners(); //to extract accounnts from hardhat using ethers

    alphaToken = await Token.deploy(tokenCap, tokenBlockReward); //to deploy Token contract and capturing its instance
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await alphaToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await alphaToken.balanceOf(owner.address);
      expect(await alphaToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await alphaToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
      const blockReward = await alphaToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(
        tokenBlockReward
      );
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await alphaToken.transfer(addr1.address, 50);
      const addr1Balance = await alphaToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await alphaToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await alphaToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await alphaToken.balanceOf(owner.address);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        alphaToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await alphaToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await alphaToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await alphaToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await alphaToken.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await alphaToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await alphaToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await alphaToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
