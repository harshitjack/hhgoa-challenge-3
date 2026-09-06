const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerificationRegistry Smart Contract", function () {
  let registry;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
    registry = await VerificationRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("should deploy with 0 initial registrations", async function () {
    const total = await registry.totalRegistrations();
    expect(total).to.equal(0n);
  });

  it("should successfully register a content hash and emit ContentRegistered event", async function () {
    const testHash = ethers.keccak256(ethers.toUtf8Bytes("matched-content-image-data"));
    const testUrl = "https://instagram.com/p/test-post-123";

    const tx = await registry.connect(owner).registerContent(testHash, testUrl);
    const receipt = await tx.wait();

    // Verify total incremented
    expect(await registry.totalRegistrations()).to.equal(1n);

    // Verify recordExists
    expect(await registry.recordExists(testHash)).to.be.true;

    // Verify verifyContent returns correct data
    const [exists, sourceUrl, timestamp, registeredBy] = await registry.verifyContent(testHash);
    expect(exists).to.be.true;
    expect(sourceUrl).to.equal(testUrl);
    expect(timestamp).to.be.greaterThan(0n);
    expect(registeredBy).to.equal(owner.address);

    // Check event emission
    await expect(tx)
      .to.emit(registry, "ContentRegistered")
      .withArgs(testHash, testUrl, timestamp, owner.address);
  });

  it("should prevent duplicate registration of the exact same content hash", async function () {
    const testHash = ethers.keccak256(ethers.toUtf8Bytes("unique-sample-hash"));
    const testUrl = "https://x.com/post/456";

    await registry.registerContent(testHash, testUrl);

    // Attempt duplicate
    await expect(
      registry.registerContent(testHash, "https://different-url.com")
    ).to.be.revertedWith("Content hash already registered");
  });

  it("should reject zero hash or empty source URL", async function () {
    const zeroHash = ethers.ZeroHash;
    const testUrl = "https://test.com";

    await expect(
      registry.registerContent(zeroHash, testUrl)
    ).to.be.revertedWith("Invalid content hash");

    const validHash = ethers.keccak256(ethers.toUtf8Bytes("content"));
    await expect(
      registry.registerContent(validHash, "")
    ).to.be.revertedWith("Source URL cannot be empty");
  });

  it("should return false for unregistered hash in verifyContent", async function () {
    const unregHash = ethers.keccak256(ethers.toUtf8Bytes("not-registered"));
    const [exists, sourceUrl, timestamp, registeredBy] = await registry.verifyContent(unregHash);

    expect(exists).to.be.false;
    expect(sourceUrl).to.equal("");
    expect(timestamp).to.equal(0n);
    expect(registeredBy).to.equal(ethers.ZeroAddress);
  });
});
