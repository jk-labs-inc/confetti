// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "./governance/extensions/GovernorCountingSimple.sol";
import "./governance/extensions/GovernorModuleRegistry.sol";
import "./governance/extensions/GovernorEngagement.sol";

contract Contest is GovernorCountingSimple, GovernorModuleRegistry, GovernorEngagement {
    uint256 public constant SECONDS_IN_DAY = 86400;

    error PeriodsOutsideBounds();
    error RankLimitCannotBeZero();

    constructor(ConstructorArgs memory _constructorArgs)
        Governor(_constructorArgs)
        GovernorSorting(_constructorArgs.intConstructorArgs.sortingEnabled, _constructorArgs.intConstructorArgs.rankLimit)
    {
        if (
            (_constructorArgs.intConstructorArgs.votingDelay > (30 * SECONDS_IN_DAY))
                || (_constructorArgs.intConstructorArgs.votingPeriod > SECONDS_IN_DAY)
        ) {
            revert PeriodsOutsideBounds();
        }

        if (_constructorArgs.intConstructorArgs.rankLimit == 0) revert RankLimitCannotBeZero();
    }
}
