import { expect } from "chai";
import { ethers } from "hardhat";

describe("VkuCoin", function () {
  let vkuCoin: any;
  let admin: any;
  let student1: any;
  let student2: any;
  let nonStudent: any;
  let ADMIN_ROLE: string;
  let STUDENT_ROLE: string;

  beforeEach(async function () {
    const [adminSigner, student1Signer, student2Signer, nonStudentSigner] =
      await ethers.getSigners();
    admin = adminSigner;
    student1 = student1Signer;
    student2 = student2Signer;
    nonStudent = nonStudentSigner;

    const VkuCoinFactory = await ethers.getContractFactory("VkuCoin");
    vkuCoin = await VkuCoinFactory.deploy(admin.address);
    await vkuCoin.waitForDeployment();

    // Get role hashes
    ADMIN_ROLE = await vkuCoin.ADMIN_ROLE();
    STUDENT_ROLE = await vkuCoin.STUDENT_ROLE();

    // Add student1 as a student
    await vkuCoin.connect(admin).addStudent(student1.address);
  });

  describe("Deployment", function () {
    it("Should assign admin role to the deployer", async function () {
      expect(await vkuCoin.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
    });

    it("Should assign the total supply of tokens to the admin", async function () {
      const totalSupply = await vkuCoin.totalSupply();
      expect(await vkuCoin.balanceOf(admin.address)).to.equal(totalSupply);
    });

    it("Should have correct name and symbol", async function () {
      expect(await vkuCoin.name()).to.equal("VKU");
      expect(await vkuCoin.symbol()).to.equal("VKU");
    });
  });

  describe("Role Management", function () {
    it("Should add student role correctly", async function () {
      expect(await vkuCoin.isStudent(student1.address)).to.equal(true);
      expect(await vkuCoin.isStudent(nonStudent.address)).to.equal(false);
    });

    it("Should remove student role correctly", async function () {
      await vkuCoin.connect(admin).removeStudent(student1.address);
      expect(await vkuCoin.isStudent(student1.address)).to.equal(false);
    });

    it("Should not allow non-admins to add students", async function () {
      await expect(vkuCoin.connect(student1).addStudent(student2.address)).to.be
        .reverted;
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from admin to student1
      await vkuCoin.connect(admin).transfer(student1.address, 50);
      const student1Balance = await vkuCoin.balanceOf(student1.address);
      expect(student1Balance).to.equal(50);

      // Transfer 25 tokens from student1 to student2
      await vkuCoin.connect(student1).transfer(student2.address, 25);
      const student2Balance = await vkuCoin.balanceOf(student2.address);
      expect(student2Balance).to.equal(25);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialAdminBalance = await vkuCoin.balanceOf(admin.address);
      await expect(
        vkuCoin
          .connect(student1)
          .transfer(admin.address, ethers.parseEther("1000000"))
      ).to.be.reverted;

      // Admin balance shouldn't have changed
      expect(await vkuCoin.balanceOf(admin.address)).to.equal(
        initialAdminBalance
      );
    });
  });

  describe("Minting", function () {
    it("Should allow only admin to mint tokens", async function () {
      // Initial balance should be 0
      expect(await vkuCoin.balanceOf(student1.address)).to.equal(0);

      // Mint 100 tokens
      await vkuCoin.connect(admin).mint(student1.address, 100);
      expect(await vkuCoin.balanceOf(student1.address)).to.equal(100);

      await expect(vkuCoin.connect(student1).mint(student2.address, 100)).to.be
        .reverted;
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      // Transfer 100 tokens to student1
      await vkuCoin.connect(admin).transfer(student1.address, 100);
      expect(await vkuCoin.balanceOf(student1.address)).to.equal(100);

      // Burn 50 tokens
      await vkuCoin.connect(student1).burn(50);
      expect(await vkuCoin.balanceOf(student1.address)).to.equal(50);
    });
  });
});
