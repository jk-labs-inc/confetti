// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "../Governor.sol";

/**
 * @dev Extension of {Governor} for analytics features.
 */
abstract contract GovernorAnalytics {
    mapping(address => uint256) public totalSpentByAddress;
    mapping(address => mapping(uint256 => uint256)) public totalSpentByAddressOnProposal;

    /**
     * @dev Return the amount spent by an address on the contest as a whole so far.
     */
    function getTotalSpentByAddress(address spendingAddress) public view returns (uint256 totalSpent) {
        return totalSpentByAddress[spendingAddress];
    }

    /**
     * @dev Return the amount spent by an address on the contest as a whole so far.
     */
    function getTotalSpentByAddressOnProposal(address spendingAddress, uint256 proposalId) public view returns (uint256 totalSpent) {
        return totalSpentByAddressOnProposal[spendingAddress][proposalId];
    }
}
