// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "@forge-std/Test.sol";
import "../src/Contest.sol";
import "../src/governance/Governor.sol";
import "./mocks/MockTIP20.sol";

contract ContestTest is Test {
    // CONTEST VARS
    Contest public payPerVoteNativeExpCurveContest;
    Contest public payPerVoteTIP20ExpCurveContest;
    Contest public payPerVoteLogCurveContest;

    // BASIC PARAMS
    string public constant CONTEST_NAME = "test";
    string public constant CONTEST_PROMPT = "prompt";
    uint64 public constant ANYONE_CAN_SUBMIT = 1;
    uint64 public constant CONTEST_START = 1681650000;
    uint64 public constant VOTING_DELAY = 10000;
    uint64 public constant VOTING_PERIOD = 10000;
    uint64 public constant NUM_ALLOWED_PROPOSAL_SUBMISSIONS = 4;
    uint64 public constant MAX_PROPOSAL_COUNT = 100;

    // COST PARAMS
    uint256 public constant NINETY_PERCENT_TO_REWARDS = 90;
    uint256 public constant CREATOR_SPLIT_ENABLED = 1;
    uint256 public constant ZERO_COST_TO_VOTE = 0;
    uint256 public constant STANDARD_COST_TO_VOTE = 100000000000000;
    uint256 public constant EXPONENTIAL_PRICE_CURVE_TYPE = 0;
    uint256 public constant STANDARD_EXPONENT_MULTIPLE = 33000000000000000; // for a terminal value 10x from min
    uint256 public constant LOGARITHMIC_PRICE_CURVE_TYPE = 1;
    uint256 public constant STANDARD_LOGARITHMIC_MULTIPLE = 20744750000000; // for a terminal value 10x from min
    address public constant JK_LABS_SPLIT_DESTINATION = JK_LABS_ADDRESS;
    address public constant NATIVE_VOTE_CURRENCY = address(0);
    address public constant TIP20_VOTE_CURRENCY = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    // SORTING INT PARAMS
    uint256 public constant RANK_LIMIT_250 = 250;

    // ENTRY PARAMS
    string public CONTEST_ENTRY_TYPE = "TEXT";

    Governor.IntConstructorArgs public payPerVoteExpCurveIntConstructorArgs = Governor.IntConstructorArgs(
        ANYONE_CAN_SUBMIT,
        CONTEST_START,
        VOTING_DELAY,
        VOTING_PERIOD,
        NUM_ALLOWED_PROPOSAL_SUBMISSIONS,
        MAX_PROPOSAL_COUNT,
        RANK_LIMIT_250,
        NINETY_PERCENT_TO_REWARDS,
        STANDARD_COST_TO_VOTE,
        EXPONENTIAL_PRICE_CURVE_TYPE,
        STANDARD_EXPONENT_MULTIPLE,
        CREATOR_SPLIT_ENABLED
    );

    Governor.IntConstructorArgs public payPerVoteLogCurveIntConstructorArgs = Governor.IntConstructorArgs(
        ANYONE_CAN_SUBMIT,
        CONTEST_START,
        VOTING_DELAY,
        VOTING_PERIOD,
        NUM_ALLOWED_PROPOSAL_SUBMISSIONS,
        MAX_PROPOSAL_COUNT,
        RANK_LIMIT_250,
        NINETY_PERCENT_TO_REWARDS,
        STANDARD_COST_TO_VOTE,
        LOGARITHMIC_PRICE_CURVE_TYPE,
        STANDARD_LOGARITHMIC_MULTIPLE,
        CREATOR_SPLIT_ENABLED
    );

    Governor.ConstructorArgs public payPerVoteNativeExpCurveParams = Governor.ConstructorArgs(
        CONTEST_NAME,
        CONTEST_PROMPT,
        payPerVoteExpCurveIntConstructorArgs,
        JK_LABS_SPLIT_DESTINATION,
        CONTEST_ENTRY_TYPE,
        NATIVE_VOTE_CURRENCY
    );

    Governor.ConstructorArgs public payPerVoteTIP20ExpCurveParams = Governor.ConstructorArgs(
        CONTEST_NAME,
        CONTEST_PROMPT,
        payPerVoteExpCurveIntConstructorArgs,
        JK_LABS_SPLIT_DESTINATION,
        CONTEST_ENTRY_TYPE,
        TIP20_VOTE_CURRENCY
    );

    Governor.ConstructorArgs public payPerVoteNativeLogCurveParams = Governor.ConstructorArgs(
        CONTEST_NAME,
        CONTEST_PROMPT,
        payPerVoteLogCurveIntConstructorArgs,
        JK_LABS_SPLIT_DESTINATION,
        CONTEST_ENTRY_TYPE,
        NATIVE_VOTE_CURRENCY
    );

    address public constant JK_LABS_ADDRESS = 0xDc652C746A8F85e18Ce632d97c6118e8a52fa738;
    address public constant CREATOR_ADDRESS = 0xc109636a2b47f8b290cc134dd446Fcd7d7e0cC94;
    address public constant TEST_ADDRESS_1 = 0xd698e31229aB86334924ed9DFfd096a71C686900;
    address public constant TEST_ADDRESS_2 = 0x016C8780e5ccB32E5CAA342a926794cE64d9C364;

    // PROPOSAL PARAMS
    uint256[] public proposalsToDelete;

    Governor.ProposalCore public testAddress1AuthorProposal =
        Governor.ProposalCore({author: TEST_ADDRESS_1, description: "testAddress1AuthorProposal", exists: true});

    // REWARDS MODULE VARS
    VoterRewardsModule public voterRewardsModuleNative;
    VoterRewardsModule public voterRewardsModuleTIP20;
    uint256[] public payees = [1, 2, 3];
    uint256[] public shares = [3, 2, 1];

    // TIP20 TOKEN VARS
    MockTIP20 public testTIP20;
    uint256 public constant INITIAL_TEST_TIP20_SUPPLY = 1e3;

    /////////////////////////////

    // SETUP

    function setUp() public {
        vm.startPrank(CREATOR_ADDRESS);

        payPerVoteNativeExpCurveContest = new Contest(payPerVoteNativeExpCurveParams);
        voterRewardsModuleNative = new VoterRewardsModule(payees, shares, Contest(payPerVoteNativeExpCurveContest));
        payPerVoteNativeExpCurveContest.setOfficialRewardsModule(address(voterRewardsModuleNative));

        payPerVoteTIP20ExpCurveContest = new Contest(payPerVoteTIP20ExpCurveParams);
        voterRewardsModuleTIP20 = new VoterRewardsModule(payees, shares, Contest(payPerVoteTIP20ExpCurveContest));
        payPerVoteTIP20ExpCurveContest.setOfficialRewardsModule(address(voterRewardsModuleTIP20));

        payPerVoteLogCurveContest = new Contest(payPerVoteNativeLogCurveParams);

        deployCodeTo(
            "MockTIP20.sol:MockTIP20",
            abi.encode("test", "TEST", INITIAL_TEST_TIP20_SUPPLY, CREATOR_ADDRESS),
            TIP20_VOTE_CURRENCY
        );
        testTIP20 = MockTIP20(TIP20_VOTE_CURRENCY);

        vm.stopPrank();
    }

    /////////////////////////////

    // GOVERNOR SETTINGS

    function testContestStart() public view {
        assertEq(payPerVoteNativeExpCurveContest.contestStart(), CONTEST_START);
    }

    function testVotingDelay() public view {
        assertEq(payPerVoteNativeExpCurveContest.votingDelay(), VOTING_DELAY);
    }

    function testVotingPeriod() public view {
        assertEq(payPerVoteNativeExpCurveContest.votingPeriod(), VOTING_PERIOD);
    }

    function testNumAllowedProposalSubmissions() public view {
        assertEq(payPerVoteNativeExpCurveContest.numAllowedProposalSubmissions(), NUM_ALLOWED_PROPOSAL_SUBMISSIONS);
    }

    function testMaxProposalCount() public view {
        assertEq(payPerVoteNativeExpCurveContest.maxProposalCount(), MAX_PROPOSAL_COUNT);
    }

    function testCreator() public view {
        assertEq(payPerVoteNativeExpCurveContest.creator(), CREATOR_ADDRESS);
    }

    /////////////////////////////

    // PROPOSING

    function testValidate() public {
        vm.prank(TEST_ADDRESS_1);
        payPerVoteNativeExpCurveContest.validateProposalData(testAddress1AuthorProposal);
    }

    function testPropose() public {
        vm.warp(1681650001);
        vm.prank(TEST_ADDRESS_1);
        payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
    }

    function testProposeDuplicateProposal() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId = payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.expectRevert(abi.encodeWithSelector(Governor.DuplicateSubmission.selector, proposalId));
        payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.stopPrank();
    }

    function testDeleteProposal() public {
        vm.warp(1681650001);
        vm.prank(TEST_ADDRESS_1);
        uint256 proposalId = payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);

        proposalsToDelete.push(proposalId);
        vm.prank(CREATOR_ADDRESS);
        payPerVoteNativeExpCurveContest.deleteProposals(proposalsToDelete);
        assertEq(payPerVoteNativeExpCurveContest.proposalIsDeleted(proposalId), true);
    }

    /////////////////////////////

    // VOTING

    function testVote() public {
        vm.startPrank(TEST_ADDRESS_1);

        vm.warp(1681650001);
        uint256 proposalId = payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 10 * payPerVoteNativeExpCurveContest.currentPricePerVote());
        payPerVoteNativeExpCurveContest.castVote{value: 10 * payPerVoteNativeExpCurveContest.currentPricePerVote()}(
            proposalId, 10 ether
        );

        vm.stopPrank();
    }

    function testTIP20Vote() public {
        vm.warp(1681650001);
        vm.prank(TEST_ADDRESS_1);
        uint256 proposalId = payPerVoteTIP20ExpCurveContest.propose(testAddress1AuthorProposal);

        vm.warp(1681660001);
        vm.startPrank(CREATOR_ADDRESS);
        testTIP20.transfer(address(TEST_ADDRESS_1), 10 * payPerVoteTIP20ExpCurveContest.currentPricePerVote());
        vm.stopPrank();
        vm.startPrank(TEST_ADDRESS_1);
        testTIP20.approve(address(payPerVoteTIP20ExpCurveContest), 1000);
        payPerVoteTIP20ExpCurveContest.castVote(proposalId, 10 ether);
        vm.stopPrank();
    }

    function testVoteOnNonExistentProposal() public {
        vm.startPrank(TEST_ADDRESS_1);

        vm.warp(1681660001);
        uint256 proposalId = 1;

        vm.deal(address(TEST_ADDRESS_1), 10 * payPerVoteNativeExpCurveContest.currentPricePerVote());
        uint256 voteValue = 10 * payPerVoteNativeExpCurveContest.currentPricePerVote();
        vm.expectRevert(abi.encodeWithSelector(Governor.ProposalDoesNotExist.selector));
        payPerVoteNativeExpCurveContest.castVote{value: voteValue}(proposalId, 10 ether);

        vm.stopPrank();
    }

    function testVoteExpCurve1() public {
        vm.warp(1681665000);
        assertEq(payPerVoteNativeExpCurveContest.currentPricePerVote(), 312000000000000); // 49.8% of way through
    }

    function testVoteExpCurve2() public {
        vm.warp(1681670000);
        assertEq(payPerVoteNativeExpCurveContest.currentPricePerVote(), 975000000000000); // 99.6% of way through
    }

    function testVoteLogCurve1() public {
        vm.warp(1681665000);
        assertEq(payPerVoteLogCurveContest.currentPricePerVote(), 548000000000000); // 49.8% of way through
    }

    function testVoteLogCurve2() public {
        vm.warp(1681670000);
        assertEq(payPerVoteLogCurveContest.currentPricePerVote(), 996000000000000); // 99.6% of way through
    }

    function testCreatorCancelBeforeFirstVote() public {
        vm.startPrank(TEST_ADDRESS_1);
        vm.warp(1681650001);
        payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.stopPrank();

        vm.prank(CREATOR_ADDRESS);
        payPerVoteNativeExpCurveContest.cancel();

        assertEq(payPerVoteNativeExpCurveContest.canceled(), true);
    }

    function testCreatorCancelAfterFirstVote() public {
        vm.startPrank(TEST_ADDRESS_1);
        vm.warp(1681650001);
        uint256 proposalId = payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 10 * payPerVoteNativeExpCurveContest.currentPricePerVote());
        payPerVoteNativeExpCurveContest.castVote{value: 10 * payPerVoteNativeExpCurveContest.currentPricePerVote()}(
            proposalId, 10 ether
        );
        vm.stopPrank();

        vm.startPrank(CREATOR_ADDRESS);
        vm.expectRevert(abi.encodeWithSelector(Governor.CanOnlyCancelBeforeFirstVote.selector));
        payPerVoteNativeExpCurveContest.cancel();
        vm.stopPrank();
    }

    function testJkLabsCancelBeforeFirstVote() public {
        vm.startPrank(TEST_ADDRESS_1);
        vm.warp(1681650001);
        payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.stopPrank();

        vm.prank(JK_LABS_ADDRESS);
        payPerVoteNativeExpCurveContest.cancel();

        assertEq(payPerVoteNativeExpCurveContest.canceled(), true);
    }

    function testJkLabsCancelAfterFirstVote() public {
        vm.startPrank(TEST_ADDRESS_1);
        vm.warp(1681650001);
        uint256 proposalId = payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 10 * payPerVoteNativeExpCurveContest.currentPricePerVote());
        payPerVoteNativeExpCurveContest.castVote{value: 10 * payPerVoteNativeExpCurveContest.currentPricePerVote()}(
            proposalId, 10 ether
        );
        vm.stopPrank();

        vm.startPrank(JK_LABS_ADDRESS);
        vm.expectRevert(abi.encodeWithSelector(Governor.CanOnlyCancelBeforeFirstVote.selector));
        payPerVoteNativeExpCurveContest.cancel();
        vm.stopPrank();
    }

    function testCreatorSplit() public {
        vm.startPrank(TEST_ADDRESS_1);
        vm.warp(1681650001);
        uint256 proposalId = payPerVoteNativeExpCurveContest.propose(testAddress1AuthorProposal);
        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 10 * payPerVoteNativeExpCurveContest.currentPricePerVote());
        payPerVoteNativeExpCurveContest.castVote{value: 10 * payPerVoteNativeExpCurveContest.currentPricePerVote()}(
            proposalId, 10 ether
        );
        vm.stopPrank();

        assertEq(
            CREATOR_ADDRESS.balance,
            (10 * payPerVoteNativeExpCurveContest.currentPricePerVote()
                    * (100 - payPerVoteNativeExpCurveContest.percentageToRewards()) / (2 * 100))
        ); // the 2 is the denominator is because of split with creator, the 100 is because we're using a percent.
    }

    /////////////////////////////
}
