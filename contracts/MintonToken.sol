// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonToken is ERC20, Ownable {
    uint256 public constant MINT_FEE = 10 * 10**18; // 10 SHM
    address public feeCollector;
    uint256 public maxSupply;
    bool public mintable;

    event FeeCollectorSet(address indexed feeCollector);
    event MintWithFee(address indexed to, uint256 userAmount, uint256 feeAmount, address feeCollectorAddr);

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        bool _mintable,
        address initialOwner,
        address feeCollectorAddr
    ) ERC20(tokenName, tokenSymbol) Ownable(initialOwner) {
        require(feeCollectorAddr != address(0), "Fee collector cannot be zero address");
        maxSupply = _maxSupply;
        mintable = _mintable;
        feeCollector = feeCollectorAddr;
        emit FeeCollectorSet(feeCollectorAddr);

        _mint(initialOwner, initialSupply);
    }

    function mint(address to, uint256 amount) public payable {
        require(mintable, "Token is not mintable");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(msg.value >= MINT_FEE, "Insufficient minting fee");
        require(to != address(0), "Invalid recipient address");
        require(feeCollector != address(0), "Fee collector not set");

        uint256 feeAmount = (amount * 1) / 1000; // 0.1% fee
        require(feeAmount > 0, "Amount too small for fee");
        uint256 userAmount = amount - feeAmount;

        // Transfer 10 SHM to feeCollector
        (bool sent, ) = payable(feeCollector).call{value: MINT_FEE}("");
        require(sent, "Failed to send SHM fee to feeCollector");

        // Mint tokens: fee to feeCollector, then to recipient
        _mint(feeCollector, feeAmount);
        _mint(to, userAmount);

        emit MintWithFee(to, userAmount, feeAmount, feeCollector);
        emit Transfer(address(0), to, userAmount);
        emit Transfer(address(0), feeCollector, feeAmount);
    }

    function setMintable(bool _mintable) public onlyOwner {
        mintable = _mintable;
    }

    function setFeeCollector(address _feeCollector) public onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
        emit FeeCollectorSet(_feeCollector);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function name() public view virtual override returns (string memory) {
        return super.name();
    }

    function symbol() public view virtual override returns (string memory) {
        return super.symbol();
    }

    function decimals() public view virtual override returns (uint8) {
        return super.decimals();
    }
}
