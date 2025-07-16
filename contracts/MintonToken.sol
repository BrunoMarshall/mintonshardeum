// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintonToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals,
        bool isMintable,
        bool isPausable,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply * 10 ** decimals);
        if (!isMintable) {
            transferOwnership(address(0));
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, amount);
    }
}

contract MintonFactory {
    event TokenCreated(address tokenAddress, string name, string symbol, address creator);

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals,
        bool isMintable,
        bool isPausable
    ) public returns (address) {
        MintonToken newToken = new MintonToken(
            name,
            symbol,
            initialSupply,
            decimals,
            isMintable,
            isPausable,
            msg.sender
        );
        emit TokenCreated(address(newToken), name, symbol, msg.sender);
        return address(newToken);
    }
}