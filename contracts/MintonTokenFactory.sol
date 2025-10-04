// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./MintonToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MintonTokenFactory
 * @dev Factory contract for deploying custom ERC-20 tokens on Shardeum
 * @notice Users pay 5000 SHM to deploy their own token contract
 */
contract MintonTokenFactory is Ownable, ReentrancyGuard, Pausable {
    address[] public deployedTokens;
    uint256 public deploymentFee = 5000 * 10**18; // 5000 SHM
    address public feeCollector;
    
    // Maximum allowed string lengths to prevent gas griefing
    uint256 public constant MAX_NAME_LENGTH = 50;
    uint256 public constant MAX_SYMBOL_LENGTH = 10;
    
    event TokenDeployed(
        address indexed tokenAddress, 
        string name, 
        string symbol, 
        address indexed creator
    );
    event FeeCollectorSet(address indexed feeCollector);
    event DeploymentFeeUpdated(uint256 oldFee, uint256 newFee);
    event ExcessRefunded(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {
        feeCollector = 0x0eE1b98198E400d8Da9E5431F477C0A1A2269505;
        emit FeeCollectorSet(feeCollector);
    }
    
    /**
     * @dev Deploys a new ERC-20 token contract
     * @param tokenName The name of the token (e.g., "My Token")
     * @param tokenSymbol The symbol of the token (e.g., "MTK")
     * @param initialSupply Initial token supply (in wei, 18 decimals)
     * @param maxSupply Maximum token supply (in wei, 18 decimals)
     * @param mintable Whether additional tokens can be minted later
     */
    function deployToken(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint256 maxSupply,
        bool mintable
    ) public payable nonReentrant whenNotPaused {
        // Validate payment
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        
        // Validate token parameters
        require(
            bytes(tokenName).length > 0 && bytes(tokenName).length <= MAX_NAME_LENGTH, 
            "Invalid token name length"
        );
        require(
            bytes(tokenSymbol).length > 0 && bytes(tokenSymbol).length <= MAX_SYMBOL_LENGTH, 
            "Invalid token symbol length"
        );
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(initialSupply <= maxSupply, "Initial supply exceeds max supply");
        
        // Deploy new token contract
        MintonToken newToken = new MintonToken(
            tokenName,
            tokenSymbol,
            initialSupply,
            maxSupply,
            mintable,
            msg.sender  // User becomes the owner of their token
        );
        
        // Record the deployment
        deployedTokens.push(address(newToken));
        emit TokenDeployed(address(newToken), tokenName, tokenSymbol, msg.sender);
        
        // Send deployment fee to fee collector
        (bool feeSent, ) = payable(feeCollector).call{value: deploymentFee}("");
        require(feeSent, "Failed to send deployment fee");
        
        // Refund any excess payment
        if (msg.value > deploymentFee) {
            uint256 refundAmount = msg.value - deploymentFee;
            (bool refundSent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(refundSent, "Refund failed");
            emit ExcessRefunded(msg.sender, refundAmount);
        }
    }
    
    /**
     * @dev Pauses token deployment in case of emergency
     * @notice Only owner can call this function
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Resumes token deployment after being paused
     * @notice Only owner can call this function
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Updates the fee collector address
     * @param _feeCollector New fee collector address
     */
    function setFeeCollector(address _feeCollector) public onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
        emit FeeCollectorSet(_feeCollector);
    }
    
    /**
     * @dev Updates the deployment fee
     * @param _newFee New deployment fee in wei
     */
    function setDeploymentFee(uint256 _newFee) public onlyOwner {
        require(_newFee > 0, "Fee must be greater than 0");
        uint256 oldFee = deploymentFee;
        deploymentFee = _newFee;
        emit DeploymentFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Emergency withdrawal function for stuck funds
     * @notice Only use if funds get stuck in the contract
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Withdrawal failed");
    }
    
    /**
     * @dev Returns array of all deployed token addresses
     * @return Array of token contract addresses
     */
    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
    
    /**
     * @dev Returns the total number of tokens deployed
     * @return Total count of deployed tokens
     */
    function getDeployedTokenCount() public view returns (uint256) {
        return deployedTokens.length;
    }
    
    /**
     * @dev Returns a paginated list of deployed tokens
     * @param startIndex Starting index in the array
     * @param count Number of tokens to return
     * @return Array of token addresses for the specified range
     */
    function getDeployedTokensPaginated(
        uint256 startIndex, 
        uint256 count
    ) public view returns (address[] memory) {
        require(startIndex < deployedTokens.length, "Start index out of bounds");
        
        uint256 endIndex = startIndex + count;
        if (endIndex > deployedTokens.length) {
            endIndex = deployedTokens.length;
        }
        
        uint256 resultLength = endIndex - startIndex;
        address[] memory result = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = deployedTokens[startIndex + i];
        }
        
        return result;
    }
}