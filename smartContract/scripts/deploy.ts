import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy VkuCoin
  const VkuCoin = await ethers.getContractFactory("VkuCoin");
  const vkuCoin = await VkuCoin.deploy(deployer.address);
  await vkuCoin.waitForDeployment();

  const vkuCoinAddress = await vkuCoin.getAddress();
  console.log("VkuCoin deployed to:", vkuCoinAddress);

  // Deploy StudentReward
  const StudentReward = await ethers.getContractFactory("StudentReward");
  const studentReward = await StudentReward.deploy(
    vkuCoinAddress,
    deployer.address
  );
  await studentReward.waitForDeployment();

  const studentRewardAddress = await studentReward.getAddress();
  console.log("StudentReward deployed to:", studentRewardAddress);

  console.log("Update your backend/appsettings.json with these addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
