// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VkuCoin.sol";

/**
 * @title StudentReward
 * @dev Contract for rewarding students with VKU tokens for completing activities
 */
contract StudentReward is AccessControl {
    // Reference to the VkuCoin token
    VkuCoin public vkuToken;
    
    // Role definitions 
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Activity structure
    struct Activity {
        string name;
        string description;
        uint256 rewardAmount;
        bool isActive;
    }
    
    // Map activity ID to Activity
    mapping(uint256 => Activity) public activities;
    uint256 public nextActivityId;
    
    // Track which students completed which activities
    // student address => activity ID => completed
    mapping(address => mapping(uint256 => bool)) public completedActivities;
    
    // Events
    event ActivityCreated(uint256 indexed activityId, string name, uint256 rewardAmount);
    event ActivityUpdated(uint256 indexed activityId, string name, uint256 rewardAmount, bool isActive);
    event ActivityCompleted(address indexed student, uint256 indexed activityId, uint256 rewardAmount);
    
    /**
     * @dev Sets the VkuCoin token address and grants admin role
     * @param _vkuCoinAddress Address of the VKU token contract
     */
    constructor(address _vkuCoinAddress, address /* _admin */) {
        vkuToken = VkuCoin(_vkuCoinAddress);
        
        // Grant admin role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new activity with rewards
     * @param name Name of the activity
     * @param description Description of the activity
     * @param rewardAmount Amount of VKU tokens to reward upon completion
     * @return activityId ID of the created activity
     */
    function createActivity(
        string memory name, 
        string memory description, 
        uint256 rewardAmount
    ) public onlyRole(ADMIN_ROLE) returns (uint256) {
        uint256 activityId = nextActivityId;
        
        activities[activityId] = Activity({
            name: name,
            description: description,
            rewardAmount: rewardAmount,
            isActive: true
        });
        
        nextActivityId++;
        
        emit ActivityCreated(activityId, name, rewardAmount);
        
        return activityId;
    }
    
    /**
     * @dev Update an existing activity
     * @param activityId ID of the activity to update
     * @param name Updated name
     * @param description Updated description
     * @param rewardAmount Updated reward amount
     * @param isActive Whether the activity is active
     */
    function updateActivity(
        uint256 activityId,
        string memory name,
        string memory description,
        uint256 rewardAmount,
        bool isActive
    ) public onlyRole(ADMIN_ROLE) {
        require(activityId < nextActivityId, "Activity does not exist");
        
        Activity storage activity = activities[activityId];
        activity.name = name;
        activity.description = description;
        activity.rewardAmount = rewardAmount;
        activity.isActive = isActive;
        
        emit ActivityUpdated(activityId, name, rewardAmount, isActive);
    }
    
    /**
     * @dev Mark activity as completed by a student and transfer them the reward
     * @param student Address of the student who completed the activity
     * @param activityId ID of the completed activity
     * @notice Requires admin to transfer the reward tokens manually
     */
    function completeActivity(address student, uint256 activityId) public onlyRole(ADMIN_ROLE) {
        require(activityId < nextActivityId, "Activity does not exist");
        require(activities[activityId].isActive, "Activity is not active");
        require(vkuToken.isStudent(student), "Address is not a registered student");
        require(!completedActivities[student][activityId], "Student already completed this activity");
        
        Activity memory activity = activities[activityId];
        
        // Mark activity as completed for this student
        completedActivities[student][activityId] = true;
        
        // Emit event (tokens need to be transferred separately)
        emit ActivityCompleted(student, activityId, activity.rewardAmount);
    }
    
    /**
     * @dev Reward multiple students at once for completing an activity
     * @param students Array of student addresses
     * @param activityId ID of the completed activity
     */
    function batchCompleteActivity(address[] memory students, uint256 activityId) public onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < students.length; i++) {
            // Only process if the student hasn't already completed the activity
            if (!completedActivities[students[i]][activityId] && vkuToken.isStudent(students[i])) {
                completeActivity(students[i], activityId);
            }
        }
    }
    
    /**
     * @dev Check if a student has completed an activity
     * @param student Address of the student
     * @param activityId ID of the activity
     * @return True if the student has completed the activity
     */
    function hasCompleted(address student, uint256 activityId) public view returns (bool) {
        require(activityId < nextActivityId, "Activity does not exist");
        return completedActivities[student][activityId];
    }
    
    /**
     * @dev Get details of an activity
     * @param activityId ID of the activity
     * @return name Name of the activity
     * @return description Description of the activity
     * @return rewardAmount Amount of tokens rewarded for completion
     * @return isActive Whether the activity is active
     */
    function getActivity(uint256 activityId) public view returns (
        string memory name,
        string memory description,
        uint256 rewardAmount,
        bool isActive
    ) {
        require(activityId < nextActivityId, "Activity does not exist");
        Activity memory activity = activities[activityId];
        
        return (
            activity.name,
            activity.description,
            activity.rewardAmount,
            activity.isActive
        );
    }
} 