require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const POLYGON_RPC_URL =
  process.env.POLYGON_RPC_URL || "https://polygon-amoy.drpc.org";

const PRIVATE_KEY =
  process.env.PRIVATE_KEY &&
    (
      process.env.PRIVATE_KEY.length === 64 ||
      (
        process.env.PRIVATE_KEY.startsWith("0x") &&
        process.env.PRIVATE_KEY.length === 66
      )
    )
    ? (
      process.env.PRIVATE_KEY.startsWith("0x")
        ? process.env.PRIVATE_KEY
        : `0x${process.env.PRIVATE_KEY}`
    )
    : "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
    },

    amoy: {
      url: POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};