import { ethers } from "hardhat";

async function main() {
  // Get the first account to use as the admin
  const [admin] = await ethers.getSigners();
  console.log("Deploying contracts with the admin account:", admin.address);

  // Check the balance before deployment
  const balance = await ethers.provider.getBalance(admin.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Deploy the VkuCoin contract
  console.log("\nDeploying VkuCoin...");
  const VkuCoin = await ethers.getContractFactory("VkuCoin");
  const vkuCoin = await VkuCoin.deploy(admin.address);
  await vkuCoin.waitForDeployment();

  // Get role hashes
  const ADMIN_ROLE = await vkuCoin.ADMIN_ROLE();
  const STUDENT_ROLE = await vkuCoin.STUDENT_ROLE();

  console.log("VkuCoin deployed to:", await vkuCoin.getAddress());
  console.log("Token name:", await vkuCoin.name());
  console.log("Token symbol:", await vkuCoin.symbol());
  console.log("Total supply:", ethers.formatEther(await vkuCoin.totalSupply()));
  console.log(
    "Admin balance:",
    ethers.formatEther(await vkuCoin.balanceOf(admin.address))
  );
  console.log(
    "Admin has ADMIN_ROLE:",
    await vkuCoin.hasRole(ADMIN_ROLE, admin.address)
  );

  // Deploy the StudentReward contract
  console.log("\nDeploying StudentReward...");
  const StudentReward = await ethers.getContractFactory("StudentReward");
  const studentReward = await StudentReward.deploy(
    await vkuCoin.getAddress(),
    admin.address
  );
  await studentReward.waitForDeployment();

  console.log("StudentReward deployed to:", await studentReward.getAddress());
  console.log(
    "VkuCoin address in StudentReward:",
    await studentReward.vkuToken()
  );

  // Create a sample activity
  const tx = await studentReward.createActivity(
    "Complete Blockchain Course",
    "Finish all lessons and assignments in the blockchain course",
    500
  );
  await tx.wait();
  console.log("Sample activity created with 500 VKU reward");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
