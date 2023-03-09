const { network } = require("hardhat");
const { developmentChains } = require("../hardhat-helper-config");

module.exports = async function () {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const DECIMALS = 8;
  const INITIAL_ANSWER = 2000000000;

  if (developmentChains.includes(network.name)) {
    log("Deploying mockv3Aggregator");
    const mockV3Aggregator = await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });
    log(`MockV3Aggregator contract address: ${mockV3Aggregator.address}`);
  }
};

module.exports.tags = ["all", "mocks"];
