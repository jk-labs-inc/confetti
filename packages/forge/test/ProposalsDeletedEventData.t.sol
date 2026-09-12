// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "@forge-std/Test.sol";
import "../src/Contest.sol";
import "../src/governance/Governor.sol";
import "../src/modules/VoterRewardsModule.sol";

/// @notice Regression + negative-control tests for the ProposalsDeleted event payload.
/// @dev deleteProposals used to emit the `proposalIds` state variable (ALL proposals
///      ever submitted) instead of the `proposalIdsToDelete` parameter, so indexers
///      listening to the event saw every proposal id as deleted. The event must
///      carry exactly the ids passed to the call.
contract ProposalsDeletedEventDataTest is Test {
    address public constant JK_LABS_ADDRESS = 0xDc652C746A8F85e18Ce632d97c6118e8a52fa738;
    address public constant CREATOR_ADDRESS = 0xc109636a2b47f8b290cc134dd446Fcd7d7e0cC94;
    address public constant TEST_ADDRESS_1 = 0xd698e31229aB86334924ed9DFfd096a71C686900;

    Contest public contest;

    string public constant CONTEST_NAME = "test";
    string public constant CONTEST_PROMPT = "prompt";
    uint256 public constant ANYONE_CAN_SUBMIT = 1;
    uint256 public constant CONTEST_START = 1681650000;
    uint256 public constant VOTING_DELAY = 10000;
    uint256 public constant VOTING_PERIOD = 10000;
    uint256 public constant NUM_ALLOWED_PROPOSAL_SUBMISSIONS = 4;
    uint256 public constant MAX_PROPOSAL_COUNT = 100;
    uint256 public constant RANK_LIMIT_250 = 250;
    uint256 public constant NINETY_PERCENT_TO_REWARDS = 90;
    uint256 public constant ZERO_COST_TO_VOTE = 0;
    uint256 public constant EXPONENTIAL_PRICE_CURVE_TYPE = 0;
    uint256 public constant STANDARD_EXPONENT_MULTIPLE = 33000000000000000;

    // Mirror the event from Governor.sol for vm.expectEmit
    event ProposalsDeleted(uint256[] proposalIds);

    Governor.IntConstructorArgs public intConstructorArgs = Governor.IntConstructorArgs(
        ANYONE_CAN_SUBMIT,
        CONTEST_START,
        VOTING_DELAY,
        VOTING_PERIOD,
        NUM_ALLOWED_PROPOSAL_SUBMISSIONS,
        MAX_PROPOSAL_COUNT,
        RANK_LIMIT_250,
        NINETY_PERCENT_TO_REWARDS,
        ZERO_COST_TO_VOTE,
        EXPONENTIAL_PRICE_CURVE_TYPE,
        STANDARD_EXPONENT_MULTIPLE,
        uint256(1) // creatorSplitEnabled
    );

    Governor.ConstructorArgs public constructorArgs = Governor.ConstructorArgs({
        name: CONTEST_NAME,
        prompt: CONTEST_PROMPT,
        intConstructorArgs: intConstructorArgs,
        jkLabsSplitDestination: JK_LABS_ADDRESS,
        contestEntryType: "TEXT"
    });

    function setUp() public {
        vm.startPrank(CREATOR_ADDRESS);
        contest = new Contest(constructorArgs);

        // Minimal VoterRewardsModule setup (required for propose)
        uint256[] memory payees = new uint256[](1);
        payees[0] = 1;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 100;
        VoterRewardsModule rewards = new VoterRewardsModule(payees, shares, contest);
        contest.setOfficialRewardsModule(address(rewards));

        vm.stopPrank();
    }

    /// @dev Helper: submit one proposal as TEST_ADDRESS_1 and return its id.
    function _propose(string memory description) internal returns (uint256) {
        vm.prank(TEST_ADDRESS_1);
        return contest.propose(Governor.ProposalCore({author: TEST_ADDRESS_1, exists: true, description: description}));
    }

    /// @dev Two proposals exist; only one is deleted. The event payload must be
    ///      exactly [deletedId] — not the full proposalIds list [1, 2].
    function testDeleteProposalsEmitsDeletedIdsOnly() public {
        vm.warp(1681650001);
        uint256 keptId = _propose("kept");
        uint256 deletedId = _propose("deleted");

        uint256[] memory toDelete = new uint256[](1);
        toDelete[0] = deletedId;

        vm.prank(CREATOR_ADDRESS);
        vm.expectEmit(true, true, true, true);
        emit ProposalsDeleted(toDelete);
        contest.deleteProposals(toDelete);

        // The kept proposal must not be marked deleted.
        assertFalse(contest.proposalIsDeleted(keptId));
        assertTrue(contest.proposalIsDeleted(deletedId));
    }

    /// @dev Deleting a subset of proposals must emit only that subset.
    function testDeleteProposalsEmitsExactSubset() public {
        vm.warp(1681650001);
        uint256 id1 = _propose("one");
        uint256 id2 = _propose("two");
        uint256 id3 = _propose("three");

        uint256[] memory subset = new uint256[](2);
        subset[0] = id1;
        subset[1] = id3;

        vm.prank(CREATOR_ADDRESS);
        vm.expectEmit(true, true, true, true);
        emit ProposalsDeleted(subset);
        contest.deleteProposals(subset);

        assertTrue(contest.proposalIsDeleted(id1));
        assertFalse(contest.proposalIsDeleted(id2));
        assertTrue(contest.proposalIsDeleted(id3));
    }

    /// @dev On-chain state must stay aligned with the event: deletedProposalIds
    ///      (the canonical index consumed by getDeletedProposalIds) must contain
    ///      exactly the deleted subset, in call order.
    function testDeletedProposalIdsIndexMatchesEventPayload() public {
        vm.warp(1681650001);
        uint256 id1 = _propose("one");
        _propose("two");
        uint256 id3 = _propose("three");

        uint256[] memory subset = new uint256[](2);
        subset[0] = id1;
        subset[1] = id3;

        vm.prank(CREATOR_ADDRESS);
        contest.deleteProposals(subset);

        uint256[] memory index = contest.getAllDeletedProposalIds();
        assertEq(index.length, 2);
        assertEq(index[0], id1);
        assertEq(index[1], id3);
    }

    /// @dev Regression: duplicate ids in one call are de-duplicated in state
    ///      (proposalIsDeleted guard) — the event still carries the raw input.
    function testDeleteProposalsDuplicateIdsStateConsistent() public {
        vm.warp(1681650001);
        uint256 id1 = _propose("one");
        uint256 id2 = _propose("two");

        uint256[] memory withDupe = new uint256[](3);
        withDupe[0] = id1;
        withDupe[1] = id2;
        withDupe[2] = id1;

        vm.prank(CREATOR_ADDRESS);
        contest.deleteProposals(withDupe);

        // State index contains each id exactly once.
        uint256[] memory index = contest.getAllDeletedProposalIds();
        assertEq(index.length, 2);
        assertEq(index[0], id1);
        assertEq(index[1], id2);
        assertTrue(contest.proposalIsDeleted(id1));
        assertTrue(contest.proposalIsDeleted(id2));
    }

    /// @dev Negative control: an empty deletion call emits an empty payload and
    ///      touches no state — the full proposalIds list must NOT leak out.
    function testDeleteProposalsEmptyCallEmitsEmptyPayload() public {
        vm.warp(1681650001);
        _propose("one");
        _propose("two");

        uint256[] memory empty = new uint256[](0);

        vm.prank(CREATOR_ADDRESS);
        vm.expectEmit(true, true, true, true);
        emit ProposalsDeleted(empty);
        contest.deleteProposals(empty);

        // No proposal was actually deleted.
        assertEq(contest.getAllDeletedProposalIds().length, 0);
    }
}
