const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../hardhat-helper-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethPriceFeedAddress;
  let args;
  if (developmentChains.includes(network.name)) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    ethPriceFeedAddress = mockV3Aggregator.address;
    args = [ethPriceFeedAddress];
  } else {
    ethPriceFeedAddress = networkConfig[chainId]["ethPriceFeedAddress"];
    args = [ethPriceFeedAddress];
  }
  log("Deploying fund me");
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`fundMe contract address: ${fundMe.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("verify....");
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundme"];
