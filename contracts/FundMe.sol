// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotEnoughEth();
error FundMe__OnlyOwner();
error FundMe__WithdrawFailed();

contract FundMe {
    // using PriceConverter for uint256;
    uint256 private constant MINIMUM_USD = 50;
    address[] s_funders;
    mapping(address => uint256) private addressToFundersArray;
    uint256 private s_priceInUsd;
    AggregatorV3Interface private immutable i_priceFeed;
    address private immutable i_owner;

    constructor(address priceFeed) {
        i_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    function fund() public payable {
        s_priceInUsd = PriceConverter.getConversionRate(msg.value, i_priceFeed);
        if (s_priceInUsd < MINIMUM_USD) {
            revert FundMe__NotEnoughEth();
        }
        s_funders.push(msg.sender);
        addressToFundersArray[msg.sender] = msg.value;
    }

    function withdraw() public {
        address[] memory funders = s_funders;
        if (msg.sender != i_owner) {
            revert FundMe__OnlyOwner();
        }
        for (uint256 i; i < funders.length; i++) {
            address funder = funders[i];
            addressToFundersArray[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert FundMe__WithdrawFailed();
        }
    }

    function getMininumUsd() public pure returns (uint256) {
        return MINIMUM_USD;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToFundersArray(
        address index
    ) public view returns (uint256) {
        return addressToFundersArray[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getOnlyOwner() public view returns (address) {
        return i_owner;
    }
}
