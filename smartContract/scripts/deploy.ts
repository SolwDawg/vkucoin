import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Initial owner and recipient can be different addresses
  const initialOwner = deployer.address;
  const initialRecipient = deployer.address;

  const VkuFactory = await ethers.getContractFactory("VKU");
  const vkuToken = await VkuFactory.deploy(initialRecipient, initialOwner);

  await vkuToken.waitForDeployment();
  const contractAddress = await vkuToken.getAddress();

  console.log("VKU Token deployed to:", contractAddress);
  console.log("Initial owner:", initialOwner);
  console.log("Initial recipient:", initialRecipient);
  console.log("Total supply:", (await vkuToken.totalSupply()).toString());

  return {
    token: vkuToken,
    owner: initialOwner,
    address: contractAddress,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
