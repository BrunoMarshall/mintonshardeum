// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonToken is ERC20, Ownable {
    uint256 public constant MINT_FEE = 10 * 10**18; // 10 SHM
    address public feeCollector = 0x0eE1b98198E400d8Da9E5431F477C0A1A2269505; // Default fee collector
    uint256 public maxSupply;
    bool public mintable;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        bool _mintable,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        maxSupply = _maxSupply;
        mintable = _mintable;
        _mint(initialOwner, initialSupply); // Mint to the initial owner (user)
    }

    function mint(address to, uint256 amount) public payable {
        require(mintable, "Token is not mintable");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(msg.value >= MINT_FEE, "Insufficient minting fee");
        require(to != address(0), "Invalid recipient address");
        require(feeCollector != address(0), "Fee collector not set");

        uint256 feeAmount = (amount * 1) / 1000; // 0.1% fee
        uint256 userAmount = amount - feeAmount;

        // Transfer 10 SHM to feeCollector
        (bool sent, ) = payable(feeCollector).call{value: MINT_FEE}("");
        require(sent, "Failed to send SHM fee to feeCollector");

        // Mint tokens: 0.1% to feeCollector, rest to recipient
        if (feeAmount > 0) _mint(feeCollector, feeAmount);
        if (userAmount > 0) _mint(to, userAmount);

        emit Transfer(address(0), to, userAmount); // Emit Transfer for the net amount
        if (feeAmount > 0) emit Transfer(address(0), feeCollector, feeAmount); // Emit for fee
    }

    function setMintable(bool _mintable) public onlyOwner {
        mintable = _mintable;
    }

    function setFeeCollector(address _feeCollector) public onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}

contract MintonTokenFactory is Ownable {
    address[] public deployedTokens;
    uint256 public deploymentFee = 10 * 10**18; // 10 SHM to deploy a new token

    event TokenDeployed(address tokenAddress, string name, string symbol);

    constructor() Ownable(msg.sender) {}

    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 maxSupply,
        bool mintable
    ) public payable {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        MintonToken newToken = new MintonToken(name, symbol, initialSupply, maxSupply, mintable, msg.sender);
        deployedTokens.push(address(newToken));
        emit TokenDeployed(address(newToken), name, symbol);
        payable(owner()).transfer(msg.value); // Send deployment fee to owner
    }

    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
}