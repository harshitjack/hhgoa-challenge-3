const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Starting deployment of VerificationRegistry to network: ${hre.network.name}...`);

  const VerificationRegistry = await hre.ethers.getContractFactory("VerificationRegistry");
  const registry = await VerificationRegistry.deploy();

  await registry.waitForDeployment();
  const contractAddress = await registry.getAddress();

  console.log(`VerificationRegistry successfully deployed to: ${contractAddress}`);

  // Save deployment info to file for backend usage
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../src/config/contract-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment metadata saved to ${deploymentPath}`);

  // Save ABI to src/config/VerificationRegistry.json
  const artifact = await hre.artifacts.readArtifact("VerificationRegistry");
  const abiPath = path.join(__dirname, "../src/config/VerificationRegistry.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact, null, 2));
  console.log(`Contract ABI saved to ${abiPath}`);

  console.log("\nDeployment complete! You can update CONTRACT_ADDRESS in your .env file with:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
