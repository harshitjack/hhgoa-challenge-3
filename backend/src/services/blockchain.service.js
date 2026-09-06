const { ethers } = require("ethers");
const env = require("../config/env");
const logger = require("../utils/logger");

const VERIFICATION_REGISTRY_ABI = [
  "function registerContent(bytes32 _contentHash, string calldata _sourceUrl) external returns (bool)",
  "function verifyContent(bytes32 _contentHash) external view returns (bool exists, string memory sourceUrl, uint256 timestamp, address registeredBy)",
  "function recordExists(bytes32 _contentHash) external view returns (bool)",
  "event ContentRegistered(bytes32 indexed contentHash, string sourceUrl, uint256 timestamp, address indexed registeredBy)",
];

/**
 * Service for interacting with Polygon Amoy Smart Contract via ethers.js.
 * Handles content hash registration and on-chain re-verification.
 */
class BlockchainService {
  constructor() {
    this.networkName = "Polygon Amoy";
    this.rpcUrl = env.POLYGON_RPC_URL;
    this.contractAddress = env.CONTRACT_ADDRESS;
    this.privateKey = env.PRIVATE_KEY;
    this.abi = VERIFICATION_REGISTRY_ABI;
  }

  /**
   * Initializes JSON-RPC provider.
   */
  getProvider() {
    if (!this.rpcUrl) {
      throw new Error("POLYGON_RPC_URL is not configured.");
    }
    return new ethers.JsonRpcProvider(this.rpcUrl);
  }

  /**
   * Initializes signer wallet.
   */
  getSigner() {
    if (!this.privateKey) {
      throw new Error("PRIVATE_KEY is not configured for blockchain transactions.");
    }
    const formattedKey = this.privateKey.startsWith("0x") ? this.privateKey : `0x${this.privateKey}`;
    const provider = this.getProvider();
    return new ethers.Wallet(formattedKey, provider);
  }

  /**
   * Returns an instance of the deployed VerificationRegistry contract.
   * @param {boolean} withSigner
   */
  getContract(withSigner = false) {
    if (!this.contractAddress) {
      throw new Error("CONTRACT_ADDRESS is not configured in environment variables.");
    }
    const runner = withSigner ? this.getSigner() : this.getProvider();
    return new ethers.Contract(this.contractAddress, this.abi, runner);
  }

  /**
   * Registers a content fingerprint on Polygon Amoy.
   * Waits for transaction confirmation before returning.
   * @param {string} contentHash - 32-byte hex hash (0x...)
   * @param {string} sourceUrl - Discovered web source URL
   * @returns {Promise<{transactionHash: string, blockNumber: number, contractAddress: string, network: string, timestamp: number}>}
   */
  async registerContent(contentHash, sourceUrl) {
    logger.info(`Submitting content hash ${contentHash} to Polygon Amoy contract: ${this.contractAddress}...`);

    if (!contentHash || !contentHash.startsWith("0x") || contentHash.length !== 66) {
      throw new Error(`Invalid bytes32 content hash format: ${contentHash}`);
    }

    try {
      const contract = this.getContract(true);

      // Check if hash already registered on-chain
      const exists = await contract.recordExists(contentHash);
      if (exists) {
        logger.warn(`Hash ${contentHash} was already registered on-chain. Retrieving existing record.`);
        const verification = await this.verifyContent(contentHash);
        return {
          transactionHash: "ALREADY_REGISTERED",
          blockNumber: null,
          contractAddress: this.contractAddress,
          network: this.networkName,
          timestamp: verification.timestamp || Math.floor(Date.now() / 1000),
        };
      }

      // Submit transaction
      const tx = await contract.registerContent(contentHash, sourceUrl);
      logger.info(`Transaction submitted to Polygon Amoy. Hash: ${tx.hash}. Awaiting block confirmation...`);

      // Wait for 1 confirmation
      const receipt = await tx.wait(1);

      if (!receipt || receipt.status !== 1) {
        throw new Error(`Transaction failed or reverted with receipt status: ${receipt ? receipt.status : "unknown"}`);
      }

      logger.info(`Transaction confirmed in block ${receipt.blockNumber}!`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: this.contractAddress,
        network: this.networkName,
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      logger.error(`Blockchain registration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reads contract state and verifies the existence and metadata of a content hash.
   * @param {string} contentHash
   * @returns {Promise<{exists: boolean, sourceUrl: string, timestamp: number, registeredBy: string}>}
   */
  async verifyContent(contentHash) {
    if (!contentHash || !contentHash.startsWith("0x") || contentHash.length !== 66) {
      throw new Error(`Invalid bytes32 content hash format: ${contentHash}`);
    }

    try {
      const contract = this.getContract(false);
      const [exists, sourceUrl, timestamp, registeredBy] = await contract.verifyContent(contentHash);

      return {
        exists: Boolean(exists),
        sourceUrl: sourceUrl || "",
        timestamp: Number(timestamp),
        registeredBy: registeredBy || ethers.ZeroAddress,
      };
    } catch (error) {
      logger.error(`Blockchain on-chain read error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Performs on-chain re-verification by comparing the candidate's current content hash
   * with the immutable record on the smart contract.
   * @param {string} currentContentHash
   * @returns {Promise<{verified: boolean, currentHash: string, onChainHash?: string, reason?: string}>}
   */
  async reverifyOnChain(currentContentHash) {
    logger.info(`Performing on-chain re-verification for hash: ${currentContentHash}`);

    try {
      const record = await this.verifyContent(currentContentHash);

      if (!record.exists) {
        return {
          verified: false,
          currentHash: currentContentHash,
          reason: "NOT_FOUND_ON_CHAIN",
        };
      }

      // Hash comparison
      const onChainHash = currentContentHash; // Because we retrieved using currentContentHash key and exists is true
      return {
        verified: true,
        currentHash: currentContentHash,
        onChainHash: onChainHash,
      };
    } catch (error) {
      logger.error(`On-chain reverification failed: ${error.message}`);
      return {
        verified: false,
        reason: error.message.includes("mismatch") ? "HASH_MISMATCH" : "REVERIFICATION_FAILED",
      };
    }
  }
}

module.exports = new BlockchainService();
module.exports.BlockchainService = BlockchainService;
module.exports.VERIFICATION_REGISTRY_ABI = VERIFICATION_REGISTRY_ABI;
