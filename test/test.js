const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  
  describe("DDWorkshop", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function beforeEachFunction() {
      const publicPrice = String(0.004 * (10 ** 18));
  
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      //variables
      const hiddenURI =
        "ipfs://QmSnQ8qXZX2ADbiYni9fJ4igyTDHgF9Q7HZweFb7BHTUuq/1.json";
  
      const Template = await hre.ethers.getContractFactory("DDNFT");
      const contract = await Template.deploy(hiddenURI);
  
      return {
        contract,
        owner,
        otherAccount,
        hiddenURI,
        publicPrice,
      };
    }
  
    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { contract, owner } = await loadFixture(beforeEachFunction);
  
        expect(await contract.owner()).to.equal(owner.address);
      });
  
      //Try to transfer ownership
      it("Should Transfer Ownership", async function () {
        const { contract, owner, otherAccount } = await loadFixture(
          beforeEachFunction
        );
        await contract.transferOwnership(otherAccount.address);
        expect(await contract.owner()).to.equal(otherAccount.address);
      });
    });
  
    describe("Mint", function () {
  
      it("Should revert - mint not live", async function () {
          const { contract, publicPrice } = await loadFixture(beforeEachFunction);
          // await contract.mint(1, { value: 0 });
          await expect(contract.mint(1, { value: publicPrice })).to.be.revertedWith(
            "DD - Not Yet Active."
          );
        });
  
      it("Mint one", async function () {
        const { contract, owner, publicPrice } = await loadFixture(
          beforeEachFunction
        );
        await contract.togglePublicSale();
        await contract.mint(1, { value: publicPrice });
        expect(await contract.balanceOf(owner.address)).to.equal(1);
      });
  
  
      it("Should revert mint no funds", async function () {
        const { contract } = await loadFixture(beforeEachFunction);
        // await contract.mint(1, { value: 0 });
        await contract.togglePublicSale();
        await expect(contract.mint(1, { value: 0 })).to.be.revertedWith(
          "DD - Below"
        );
      });
  
      
      it("Should mint a bunch", async function () {
        const { contract, owner, publicPrice } = await loadFixture(
          beforeEachFunction
        );
        await contract.togglePublicSale();
  
        for (let i = 0; i < 15; i++) {
          await contract.mint(1, { value: publicPrice });
        }
        expect(await contract.balanceOf(owner.address)).to.equal(15);
      });
     
      it("contract Paused mint revert", async function () {
        const { contract, owner,publicPrice, whiteListPrice, rootHash, hexProof } = await loadFixture(
          beforeEachFunction
        );
      
        await contract.togglePause();
          
        await expect(contract.mint(1, { value: publicPrice })).to.be.revertedWith("Contract Paused");
      });
  
  
      it("Should mint a cap", async function () {
        const { contract, owner, publicPrice } = await loadFixture(
          beforeEachFunction
        );
        await contract.togglePublicSale();
  
        for (let i = 0; i < 149; i++) {
          await contract.mint(1, { value: publicPrice });
        }
        expect(await contract.balanceOf(owner.address)).to.equal(149);
  
        await contract.mint(1, { value: publicPrice });
  
        await expect(contract.mint(1, { value: publicPrice })).to.be.revertedWith("DD - Beyond Max Supply");
  
      });
    });
  
    describe("Withdrawal", function () {
      it("Should fail if Non-Owner tries to withdraw", async function () {
        const { contract, otherAccount } = await loadFixture(beforeEachFunction);
  
        await expect(
          contract.connect(otherAccount).withdraw()
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
  
      /*
      it("Should Withdraw to addresses", async function () {
        const { contract, owner, publicPrice } = await loadFixture(
          beforeEachFunction
        );
  
        for (let i = 0; i < 55; i++) {
          await contract.mint(1, { value: publicPrice });
        }
        let total = publicPrice * 55;
  
        // await expect( contract.withdraw().to.changeEtherBalances([owner], [-total] ));
        //not working
      });
      */
    });
  });
  