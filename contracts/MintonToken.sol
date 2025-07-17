// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonToken is ERC20, Ownable {
    uint256 public constant MINT_FEE = 10 * 10**18; // 10 SHM (assuming 18 decimals for SHM)
    address public feeCollector = 0x0eE1b98198E400d8Da9E5431F477C0A1A2269505;
    uint256 public maxSupply;
    bool public mintable;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        bool _mintable
    ) ERC20(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintable = _mintable;
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public payable {
        require(mintable, "Token is not mintable");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(msg.value >= MINT_FEE, "Insufficient minting fee");

        uint256 feeAmount = (amount * 1) / 1000; // 0.1% of minted tokens
        uint256 userAmount = amount - feeAmount;

        // Transfer fee to feeCollector
        payable(feeCollector).transfer(MINT_FEE);
        _mint(feeCollector, feeAmount);
        _mint(to, userAmount);
    }

    // Function to allow owner to update mintable status
    function setMintable(bool _mintable) public onlyOwner {
        mintable = _mintable;
    }

    // Function to withdraw any accumulated SHM in the contract
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}