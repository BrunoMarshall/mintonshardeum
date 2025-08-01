// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./MintonToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonTokenFactory is Ownable {
    address[] public deployedTokens;
    uint256 public deploymentFee = 10 * 10**18; // 10 SHM
    address public feeCollector; // Dynamic fee collector

    event TokenDeployed(address tokenAddress, string name, string symbol);
    event FeeCollectorSet(address indexed feeCollector);

    constructor() Ownable(msg.sender) {
        feeCollector = 0x0eE1b98198E400d8Da9E5431F477C0A1A2269505; // Default fee collector
        emit FeeCollectorSet(feeCollector);
    }

    function deployToken(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint256 maxSupply,
        bool mintable,
        address feeCollectorOverride
    ) public payable {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(feeCollectorOverride != address(0), "Fee collector cannot be zero address");

        MintonToken newToken = new MintonToken(
            tokenName,
            tokenSymbol,
            initialSupply,
            maxSupply,
            mintable,
            msg.sender,
            feeCollectorOverride
        );

        deployedTokens.push(address(newToken));
        emit TokenDeployed(address(newToken), tokenName, tokenSymbol);

        // Send deployment fee to feeCollector
        (bool sent, ) = payable(feeCollector).call{value: msg.value}("");
        require(sent, "Failed to send deployment fee to feeCollector");
    }

    function setFeeCollector(address _feeCollector) public onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
        emit FeeCollectorSet(_feeCollector);
    }

    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
}