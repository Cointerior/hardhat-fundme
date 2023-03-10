const { network, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../hardhat-helper-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let deployer, sendValue;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContracts("FundMe", deployer);
        sendValue = ethers.utils.parseEther("0.5");
      });
      describe("allow user to fund and withdraw", async function () {
        await fundMe.fundMe({ value: sendValue });
        await fundMe.withdraw();
        const endingBalanceFundMe = await fundMe.provider.getBalance(
          fundMe.address
        );
        assert.equal(endingBalanceFundMe.toString(), "0");
      });
    });
