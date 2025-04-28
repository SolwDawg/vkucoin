import { expect } from "chai";
import { ethers } from "hardhat";

describe("StudentReward", function () {
  let vkuCoin: any;
  let studentReward: any;
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

    // Deploy VkuCoin first
    const VkuCoinFactory = await ethers.getContractFactory("VkuCoin");
    vkuCoin = await VkuCoinFactory.deploy(admin.address);
    await vkuCoin.waitForDeployment();

    // Get role hashes from VkuCoin
    ADMIN_ROLE = await vkuCoin.ADMIN_ROLE();
    STUDENT_ROLE = await vkuCoin.STUDENT_ROLE();

    // Add student1 and student2 as students in VkuCoin
    await vkuCoin.connect(admin).addStudent(student1.address);
    await vkuCoin.connect(admin).addStudent(student2.address);

    // Deploy StudentReward
    const StudentRewardFactory =
      await ethers.getContractFactory("StudentReward");
    studentReward = await StudentRewardFactory.deploy(
      await vkuCoin.getAddress(),
      admin.address
    );
    await studentReward.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct token address", async function () {
      expect(await studentReward.vkuToken()).to.equal(
        await vkuCoin.getAddress()
      );
    });

    it("Should assign admin role to deployer", async function () {
      const adminRole = await studentReward.ADMIN_ROLE();
      expect(await studentReward.hasRole(adminRole, admin.address)).to.equal(
        true
      );
    });
  });

  describe("Activity Management", function () {
    it("Should create a new activity", async function () {
      await studentReward
        .connect(admin)
        .createActivity(
          "Complete Assignment 1",
          "Submit the first programming assignment",
          100
        );

      const activity = await studentReward.getActivity(0);
      expect(activity.name).to.equal("Complete Assignment 1");
      expect(activity.description).to.equal(
        "Submit the first programming assignment"
      );
      expect(activity.rewardAmount).to.equal(100);
      expect(activity.isActive).to.equal(true);
    });

    it("Should update an existing activity", async function () {
      // Create activity first
      await studentReward
        .connect(admin)
        .createActivity(
          "Complete Assignment 1",
          "Submit the first programming assignment",
          100
        );

      // Update it
      await studentReward
        .connect(admin)
        .updateActivity(
          0,
          "Updated Assignment 1",
          "Updated description",
          200,
          true
        );

      const activity = await studentReward.getActivity(0);
      expect(activity.name).to.equal("Updated Assignment 1");
      expect(activity.description).to.equal("Updated description");
      expect(activity.rewardAmount).to.equal(200);
      expect(activity.isActive).to.equal(true);
    });

    it("Should not allow non-admin to create activity", async function () {
      await expect(
        studentReward
          .connect(student1)
          .createActivity("Unauthorized Activity", "This should fail", 100)
      ).to.be.reverted;
    });
  });

  describe("Activity Completion", function () {
    beforeEach(async function () {
      // Create an activity for testing
      await studentReward
        .connect(admin)
        .createActivity("Assignment 1", "First assignment", 100);
    });

    it("Should mark activity as completed for student", async function () {
      // Mark activity as completed
      await studentReward.connect(admin).completeActivity(student1.address, 0);

      // Check if activity is marked as completed
      expect(await studentReward.hasCompleted(student1.address, 0)).to.equal(
        true
      );

      // Manually reward the student (this would be done by the admin in a real scenario)
      await vkuCoin.connect(admin).mint(student1.address, 100);
      expect(await vkuCoin.balanceOf(student1.address)).to.equal(100);
    });

    it("Should not allow completing activity for non-student", async function () {
      await expect(
        studentReward.connect(admin).completeActivity(nonStudent.address, 0)
      ).to.be.revertedWith("Address is not a registered student");
    });

    it("Should not allow completing the same activity twice", async function () {
      // Complete once
      await studentReward.connect(admin).completeActivity(student1.address, 0);

      // Try to complete again
      await expect(
        studentReward.connect(admin).completeActivity(student1.address, 0)
      ).to.be.revertedWith("Student already completed this activity");
    });

    it("Should handle batch completion for multiple students", async function () {
      // Batch complete
      await studentReward
        .connect(admin)
        .batchCompleteActivity([student1.address, student2.address], 0);

      // Verify both students completed the activity
      expect(await studentReward.hasCompleted(student1.address, 0)).to.equal(
        true
      );
      expect(await studentReward.hasCompleted(student2.address, 0)).to.equal(
        true
      );

      // Manually reward the students
      await vkuCoin.connect(admin).mint(student1.address, 100);
      await vkuCoin.connect(admin).mint(student2.address, 100);

      // Verify both received tokens
      expect(await vkuCoin.balanceOf(student1.address)).to.equal(100);
      expect(await vkuCoin.balanceOf(student2.address)).to.equal(100);
    });
  });
});
