// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonToken is ERC20, Ownable {
    uint256 public constant MINT_FEE = 10 * 10**18; // 10 SHM
    address public feeCollector;
    uint256 public maxSupply;
    bool public mintable;

    event Minted(address indexed user, uint256 amountMinted, uint256 feeInTokens);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        bool _mintable,
        address initialOwner,
        address _feeCollector
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(_feeCollector != address(0), "Fee collector cannot be zero address");
        maxSupply = _maxSupply;
        mintable = _mintable;
        feeCollector = _feeCollector;
        _mint(initialOwner, initialSupply);
    }

    function mint(address to, uint256 amount) public payable {
        require(mintable, "Token is not mintable");
        require(to != address(0), "Invalid recipient address");
        require(feeCollector != address(0), "Fee collector not set");
        require(msg.value >= MINT_FEE, "Insufficient minting fee");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");

        uint256 feeAmount = (amount * 1) / 1000; // 0.1% fee
        uint256 userAmount = amount - feeAmount;

        // Send SHM mint fee to feeCollector
        (bool sent, ) = payable(feeCollector).call{value: MINT_FEE}("");
        require(sent, "Failed to send SHM fee to feeCollector");

        // Mint fee and user tokens
        if (feeAmount > 0) _mint(feeCollector, feeAmount);
        if (userAmount > 0) _mint(to, userAmount);

        emit Minted(to, userAmount, feeAmount);
    }

    function setMintable(bool _mintable) external onlyOwner {
        mintable = _mintable;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
