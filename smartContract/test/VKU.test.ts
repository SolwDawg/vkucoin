import { expect } from "chai";
import { ethers } from "hardhat";
import { VKU } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VKU Token", function () {
  let vkuToken: VKU;
  let owner: SignerWithAddress;
  let recipient: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const initialSupply = ethers.parseUnits("10000000", 18);

  beforeEach(async function () {
    [owner, recipient, addr1, addr2, ...addrs] = await ethers.getSigners();

    const VkuFactory = await ethers.getContractFactory("VKU");
    vkuToken = (await VkuFactory.deploy(
      recipient.address,
      owner.address
    )) as VKU;
    await vkuToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await vkuToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the recipient", async function () {
      const recipientBalance = await vkuToken.balanceOf(recipient.address);
      expect(recipientBalance).to.equal(initialSupply);
    });

    it("Should have correct token metadata", async function () {
      expect(await vkuToken.name()).to.equal("VKU");
      expect(await vkuToken.symbol()).to.equal("VKU");
      expect(await vkuToken.decimals()).to.equal(18);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from recipient to addr1
      const transferAmount = ethers.parseUnits("50", 18);
      await vkuToken.connect(recipient).transfer(addr1.address, transferAmount);

      // Check balances
      const addr1Balance = await vkuToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      const recipientBalance = await vkuToken.balanceOf(recipient.address);
      expect(recipientBalance).to.equal(initialSupply - transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialAddr1Balance = await vkuToken.balanceOf(addr1.address);
      const transferAmount = ethers.parseUnits("1", 18);

      // Try to send 1 token from addr1 (who has 0 tokens)
      await expect(
        vkuToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(vkuToken, "ERC20InsufficientBalance");

      // Balances should not have changed
      expect(await vkuToken.balanceOf(addr1.address)).to.equal(
        initialAddr1Balance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialRecipientBalance = await vkuToken.balanceOf(
        recipient.address
      );

      // Transfer to addr1
      await vkuToken
        .connect(recipient)
        .transfer(addr1.address, ethers.parseUnits("100", 18));

      // Transfer from addr1 to addr2
      await vkuToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseUnits("50", 18));

      // Check balances
      const recipientBalance = await vkuToken.balanceOf(recipient.address);
      const addr1Balance = await vkuToken.balanceOf(addr1.address);
      const addr2Balance = await vkuToken.balanceOf(addr2.address);

      expect(recipientBalance).to.equal(
        initialRecipientBalance - ethers.parseUnits("100", 18)
      );
      expect(addr1Balance).to.equal(ethers.parseUnits("50", 18));
      expect(addr2Balance).to.equal(ethers.parseUnits("50", 18));
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const initialSupply = await vkuToken.totalSupply();
      const burnAmount = ethers.parseUnits("100", 18);

      await vkuToken.connect(recipient).burn(burnAmount);

      // Check balances and total supply
      const recipientBalance = await vkuToken.balanceOf(recipient.address);
      const newTotalSupply = await vkuToken.totalSupply();

      expect(recipientBalance).to.equal(initialSupply - burnAmount);
      expect(newTotalSupply).to.equal(initialSupply - burnAmount);
    });
  });

  describe("Minting", function () {
    it("Should allow only owner to mint tokens", async function () {
      const initialSupply = await vkuToken.totalSupply();
      const mintAmount = ethers.parseUnits("1000", 18);

      // Mint tokens to addr1
      await vkuToken.connect(owner).mint(addr1.address, mintAmount);

      // Check balance and total supply
      const addr1Balance = await vkuToken.balanceOf(addr1.address);
      const newTotalSupply = await vkuToken.totalSupply();

      expect(addr1Balance).to.equal(mintAmount);
      expect(newTotalSupply).to.equal(initialSupply + mintAmount);
    });

    it("Should fail when non-owner tries to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);

      // Try to mint from non-owner account
      await expect(
        vkuToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(vkuToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Permit", function () {
    it("Should support ERC20Permit functionality", async function () {
      // Check that the permit function exists
      expect(typeof vkuToken.permit).to.equal("function");
    });
  });
});
