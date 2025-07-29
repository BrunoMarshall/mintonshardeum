// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MintonToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonTokenFactory is Ownable {
    address[] public deployedTokens;
    uint256 public deploymentFee = 10 * 10**18;

    event TokenDeployed(address tokenAddress, string name, string symbol);

    constructor() Ownable(msg.sender) {}

    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 maxSupply,
        bool mintable,
        address feeCollectorOverride
    ) public payable {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(feeCollectorOverride != address(0), "Fee collector cannot be zero address");

        MintonToken newToken = new MintonToken(
            name,
            symbol,
            initialSupply,
            maxSupply,
            mintable,
            msg.sender,
            feeCollectorOverride
        );

        deployedTokens.push(address(newToken));
        emit TokenDeployed(address(newToken), name, symbol);

        payable(owner()).transfer(msg.value);
    }

    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
}