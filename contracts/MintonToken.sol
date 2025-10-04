// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonToken is ERC20, Ownable {
    uint256 public maxSupply;
    bool public mintable;
    
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        bool _mintable,
        address initialOwner
    ) ERC20(tokenName, tokenSymbol) Ownable(initialOwner) {
        require(initialSupply <= _maxSupply, "Initial supply exceeds max supply");
        maxSupply = _maxSupply;
        mintable = _mintable;
        
        // Mint all initial supply to the deployer (user)
        _mint(initialOwner, initialSupply);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(mintable, "Token is not mintable");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(to != address(0), "Invalid recipient address");
        
        _mint(to, amount);
    }
    
    function setMintable(bool _mintable) public onlyOwner {
        mintable = _mintable;
    }
}