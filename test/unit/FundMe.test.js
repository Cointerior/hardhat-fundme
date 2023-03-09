const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", function () {
  let fundMe, mockV3Aggregator, sendValue, deployer;
  sendValue = ethers.utils.parseEther("0.2");
  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", function () {
    it("Set aggregator address correctly", async function () {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
    it("set correct owner address", async function () {
      const response = await fundMe.getOnlyOwner();
      assert.equal(response, deployer);
    });
  });

  describe("fund", function () {
    it("revert when low eth is sent", async function () {
      await expect(fundMe.fund()).to.be.reverted;
    });
    it("adds funder to funders array", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getFunder(0);
      assert.equal(response, deployer);
    });
    it("adds funder to data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToFundersArray(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });
    it("allows only owner to withdraw", async function () {
      const response = await fundMe.getOnlyOwner();
      await fundMe.withdraw();
      assert.equal(response, deployer);
    });
    it("allows to withdraw from single funder", async function () {
      const startingBalnaceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingBalanceDeployer = await fundMe.provider.getBalance(
        deployer
      );
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);
      assert.equal(endingBalanceFundMe.toString(), "0");
      assert(
        endingBalanceDeployer.add(gasCost).toString(),
        startingBalnaceFundMe.add(startingBalanceDeployer).toString()
      );
    });
  });
});
