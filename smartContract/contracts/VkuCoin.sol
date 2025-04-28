// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VkuCoin Token
 * @dev ERC20 Token with burning and minting capabilities, controlled by roles
 */
contract VkuCoin is ERC20, ERC20Burnable, AccessControl {
    // Create role identifiers
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    constructor(address admin)
        ERC20("VKU", "VKU")
    {
        // Grant admin role to the deployer
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        // Initial supply of 1 million tokens (with 18 decimals)
        _mint(admin, 1_000_000 * 10 ** decimals());
    }

    /**
     * @dev Creates new tokens and assigns them to an account
     * @param to The account that will receive the created tokens
     * @param amount The amount of tokens to create
     */
    function mint(address to, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
    }
    
    /**
     * @dev Grants STUDENT_ROLE to an account
     * @param student The account to grant the role to
     */
    function addStudent(address student) public onlyRole(ADMIN_ROLE) {
        grantRole(STUDENT_ROLE, student);
    }
    
    /**
     * @dev Revokes STUDENT_ROLE from an account
     * @param student The account to revoke the role from
     */
    function removeStudent(address student) public onlyRole(ADMIN_ROLE) {
        revokeRole(STUDENT_ROLE, student);
    }
    
    /**
     * @dev Checks if an account has STUDENT_ROLE
     * @param account The account to check
     * @return bool True if the account has STUDENT_ROLE
     */
    function isStudent(address account) public view returns (bool) {
        return hasRole(STUDENT_ROLE, account);
    }
}
