// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "@forge-std/Test.sol";
import "@openzeppelin/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "../src/Contest.sol";
import "../src/modules/VoterRewardsModule.sol";

contract VoterRewardsModuleTest is Test {
    // CONTEST VARS
    Contest public payPerVoteExpCurveContest;
    Contest public payPerVoteExpCurveAltContest;
    Contest public payPerVoteExpCurveRankLimitOneContest;

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
    uint256 public constant CREATOR_SPLIT_DISABLED = 0; // disabled to make testing straightforwards and scoped
    uint256 public constant STANDARD_COST_TO_VOTE = 100000000000000;
    uint256 public constant FLAT_PRICE_CURVE_TYPE = 0;
    uint256 public constant ZERO_EXPONENT_MULTIPLE = 0;
    address public constant JK_LABS_SPLIT_DESTINATION = JK_LABS_ADDRESS;

    // SORTING INT PARAMS
    uint256 public constant RANK_LIMIT_1 = 1;
    uint256 public constant RANK_LIMIT_250 = 250;

    // METADATA CONSTRUCTOR PARAMS
    string public constant METADATA_FIELDS_SCHEMA =
        "{\'Test Address Field\': \'address\', \'Test String Field\': \'string\', \'Test Uint Field\': \'uint256\'}";

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
        FLAT_PRICE_CURVE_TYPE,
        ZERO_EXPONENT_MULTIPLE,
        CREATOR_SPLIT_DISABLED
    );

    Governor.ConstructorArgs public payPerVoteExpCurveParams = Governor.ConstructorArgs(
        CONTEST_NAME,
        CONTEST_PROMPT,
        payPerVoteExpCurveIntConstructorArgs,
        JK_LABS_SPLIT_DESTINATION,
        METADATA_FIELDS_SCHEMA
    );

    Governor.IntConstructorArgs public payPerVoteExpCurveRankLimitOneIntConstructorArgs = Governor.IntConstructorArgs(
        ANYONE_CAN_SUBMIT,
        CONTEST_START,
        VOTING_DELAY,
        VOTING_PERIOD,
        NUM_ALLOWED_PROPOSAL_SUBMISSIONS,
        MAX_PROPOSAL_COUNT,
        RANK_LIMIT_1,
        NINETY_PERCENT_TO_REWARDS,
        STANDARD_COST_TO_VOTE,
        FLAT_PRICE_CURVE_TYPE,
        ZERO_EXPONENT_MULTIPLE,
        CREATOR_SPLIT_DISABLED
    );

    Governor.ConstructorArgs public payPerVoteExpCurveRankLimitOneParams = Governor.ConstructorArgs(
        CONTEST_NAME,
        CONTEST_PROMPT,
        payPerVoteExpCurveRankLimitOneIntConstructorArgs,
        JK_LABS_SPLIT_DESTINATION,
        METADATA_FIELDS_SCHEMA
    );

    address public constant JK_LABS_ADDRESS = 0xDc652C746A8F85e18Ce632d97c6118e8a52fa738;
    address public constant CREATOR_ADDRESS = 0xc109636a2b47f8b290cc134dd446Fcd7d7e0cC94;
    address public constant TEST_ADDRESS_1 = 0xd698e31229aB86334924ed9DFfd096a71C686900;
    address public constant TEST_ADDRESS_2 = 0x016C8780e5ccB32E5CAA342a926794cE64d9C364;

    // METADATA PARAMS
    address[] public safeSigners = [address(0)];
    uint8 public constant SAFE_THRESHOLD = 1;
    address[] public METADATA_FIELDS_ADDRESS_ARRAY = [CREATOR_ADDRESS]; // placeholder value
    string[] public METADATA_FIELDS_STRING_ARRAY = [METADATA_FIELDS_SCHEMA]; // placeholder value
    uint256[] public METADATA_FIELDS_UINT_ARRAY = [SAFE_THRESHOLD]; // placeholder value

    // PROPOSAL PARAMS
    uint256[] public proposalsToDelete;

    Governor.ProposalCore public testAddress1AuthorProposal1 = Governor.ProposalCore({
        author: TEST_ADDRESS_1,
        description: "testAddress1AuthorProposal1",
        exists: true,
        targetMetadata: Governor.TargetMetadata({targetAddress: TEST_ADDRESS_1}),
        safeMetadata: Governor.SafeMetadata({signers: safeSigners, threshold: SAFE_THRESHOLD}),
        fieldsMetadata: Governor.FieldsMetadata({
            addressArray: METADATA_FIELDS_ADDRESS_ARRAY,
            stringArray: METADATA_FIELDS_STRING_ARRAY,
            uintArray: METADATA_FIELDS_UINT_ARRAY
        })
    });

    Governor.ProposalCore public testAddress1AuthorProposal2 = Governor.ProposalCore({
        author: TEST_ADDRESS_1,
        description: "testAddress1AuthorProposal2",
        exists: true,
        targetMetadata: Governor.TargetMetadata({targetAddress: TEST_ADDRESS_1}),
        safeMetadata: Governor.SafeMetadata({signers: safeSigners, threshold: SAFE_THRESHOLD}),
        fieldsMetadata: Governor.FieldsMetadata({
            addressArray: METADATA_FIELDS_ADDRESS_ARRAY,
            stringArray: METADATA_FIELDS_STRING_ARRAY,
            uintArray: METADATA_FIELDS_UINT_ARRAY
        })
    });

    Governor.ProposalCore public testAddress1AuthorProposal3 = Governor.ProposalCore({
        author: TEST_ADDRESS_1,
        description: "testAddress1AuthorProposal3",
        exists: true,
        targetMetadata: Governor.TargetMetadata({targetAddress: TEST_ADDRESS_1}),
        safeMetadata: Governor.SafeMetadata({signers: safeSigners, threshold: SAFE_THRESHOLD}),
        fieldsMetadata: Governor.FieldsMetadata({
            addressArray: METADATA_FIELDS_ADDRESS_ARRAY,
            stringArray: METADATA_FIELDS_STRING_ARRAY,
            uintArray: METADATA_FIELDS_UINT_ARRAY
        })
    });

    Governor.ProposalCore public testAddress1AuthorProposal4 = Governor.ProposalCore({
        author: TEST_ADDRESS_1,
        description: "testAddress1AuthorProposal4",
        exists: true,
        targetMetadata: Governor.TargetMetadata({targetAddress: TEST_ADDRESS_1}),
        safeMetadata: Governor.SafeMetadata({signers: safeSigners, threshold: SAFE_THRESHOLD}),
        fieldsMetadata: Governor.FieldsMetadata({
            addressArray: METADATA_FIELDS_ADDRESS_ARRAY,
            stringArray: METADATA_FIELDS_STRING_ARRAY,
            uintArray: METADATA_FIELDS_UINT_ARRAY
        })
    });

    // REWARDS MODULE VARS
    VoterRewardsModule public voterRewardsModule;
    VoterRewardsModule public voterRewardsModuleAlt;
    VoterRewardsModule public voterRewardsModuleToRankLimitOneContest;
    uint256[] public payees = [1, 2, 3];
    uint256[] public shares = [3, 2, 1];

    // ERC20 VARS
    ERC20PresetFixedSupply public testERC20;
    uint256 public constant INITIAL_TEST_ERC20_SUPPLY = 100;

    /////////////////////////////

    // SETUP

    function setUp() public {
        vm.startPrank(CREATOR_ADDRESS);

        // Only using flat curves bc only testing rewards module logic in this file, which is the same regardless of curve of underlying contest
        payPerVoteExpCurveContest = new Contest(payPerVoteExpCurveParams);
        payPerVoteExpCurveAltContest = new Contest(payPerVoteExpCurveParams);
        payPerVoteExpCurveRankLimitOneContest = new Contest(payPerVoteExpCurveRankLimitOneParams);

        voterRewardsModule = new VoterRewardsModule(payees, shares, Contest(payPerVoteExpCurveContest));
        voterRewardsModuleAlt = new VoterRewardsModule(payees, shares, Contest(payPerVoteExpCurveAltContest));
        voterRewardsModuleToRankLimitOneContest =
            new VoterRewardsModule(payees, shares, Contest(payPerVoteExpCurveRankLimitOneContest));

        payPerVoteExpCurveContest.setOfficialRewardsModule(address(voterRewardsModule));
        payPerVoteExpCurveAltContest.setOfficialRewardsModule(address(voterRewardsModuleAlt));
        payPerVoteExpCurveRankLimitOneContest.setOfficialRewardsModule(address(voterRewardsModuleToRankLimitOneContest));

        testERC20 = new ERC20PresetFixedSupply("test", "TEST", INITIAL_TEST_ERC20_SUPPLY, CREATOR_ADDRESS);

        vm.stopPrank();
    }

    /////////////////////////////

    // CANCELLATIONS

    function testCreatorCancelBeforeFirstVote() public {
        vm.warp(1681650001);

        vm.prank(CREATOR_ADDRESS);
        voterRewardsModule.cancel();

        assertEq(voterRewardsModule.canceled(), true);
    }

    function testCreatorCancelAfterFirstVote() public {
        vm.startPrank(TEST_ADDRESS_1);
        vm.warp(1681650001);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 10 * payPerVoteExpCurveContest.currentPricePerVote());
        payPerVoteExpCurveContest.castVote{value: 10 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 10 ether
        );
        vm.stopPrank();

        vm.startPrank(CREATOR_ADDRESS);
        vm.expectRevert(abi.encodeWithSelector(VoterRewardsModule.CreatorCanOnlyCancelBeforeFirstVote.selector));
        voterRewardsModule.cancel();
        vm.stopPrank();
    }

    function testJkLabsCancelBeforeDelay() public {
        vm.warp(1681650001);

        vm.startPrank(JK_LABS_ADDRESS);
        vm.expectRevert(abi.encodeWithSelector(VoterRewardsModule.JkLabsCanOnlyCancelAfterDelay.selector));
        voterRewardsModule.cancel();
        vm.stopPrank();
    }

    function testJkLabsCancelAfterDelay() public {
        vm.warp(voterRewardsModule.underlyingContest().contestDeadline() + voterRewardsModule.JK_LABS_CANCEL_DELAY());

        vm.prank(JK_LABS_ADDRESS);
        voterRewardsModule.cancel();

        assertEq(voterRewardsModule.canceled(), true);
    }

    /////////////////////////////

    // WITHDRAWALS

    // The creator can only withdraw from a contest that they canceled (as opposed to jk labs) and a contest can only be canceled by the creator before the first vote is cast
    function testCreatorWithdrawNative() public {
        vm.warp(1681650001);
        vm.deal(address(voterRewardsModule), 100); // give the rewards module wei to be withdrawn
        vm.startPrank(CREATOR_ADDRESS);
        voterRewardsModule.cancel();
        voterRewardsModule.withdrawRewards();
        vm.stopPrank();

        assertEq(CREATOR_ADDRESS.balance, 100);
    }

    // The creator can only withdraw from a contest that they canceled (as opposed to jk labs) and a contest can only be canceled by the creator before the first vote is cast
    function testCreatorWithdrawERC20() public {
        vm.warp(1681650001);
        vm.deal(address(voterRewardsModule), 100); // give the rewards module wei to be withdrawn
        vm.startPrank(CREATOR_ADDRESS);
        voterRewardsModule.cancel();
        voterRewardsModule.withdrawRewards();
        vm.stopPrank();

        assertEq(CREATOR_ADDRESS.balance, 100);
    }

    function testCreatorWithdrawAfterJkLabsCancel() public {
        vm.warp(voterRewardsModule.underlyingContest().contestDeadline() + voterRewardsModule.JK_LABS_CANCEL_DELAY());

        vm.prank(JK_LABS_ADDRESS);
        voterRewardsModule.cancel();

        vm.startPrank(CREATOR_ADDRESS);
        vm.expectRevert(abi.encodeWithSelector(VoterRewardsModule.CreatorCannotWithdrawIfJkLabsCanceled.selector));
        voterRewardsModule.withdrawRewards();
    }

    /////////////////////////////

    // REGULAR RELEASES

    //// PATTERN BELOW: NATIVE, ERC20

    //// 1 PROPOSAL AT 1 VOTE

    // 1 proposal at 1 vote; release to voter of rank 1
    function testReleaseToVoterFirstPlace1WithNative() public {
        vm.startPrank(TEST_ADDRESS_1);

        vm.warp(1681650001);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);

        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_1, 1);

        vm.stopPrank();

        assertEq(TEST_ADDRESS_1.balance, 45000000000000);
    }

    // 1 proposal at 1 vote; release to voter of rank 1
    function testReleaseToVoterFirstPlace1WithERC20() public {
        vm.startPrank(TEST_ADDRESS_1);

        vm.warp(1681650001);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);

        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );

        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 1);

        assertEq(testERC20.balanceOf(TEST_ADDRESS_1), 50);
    }

    // 1 proposal at 1 vote; release to voter of rank 2; revert with error message
    function testReleaseToVoterSecondPlace1WithNative() public {
        vm.startPrank(TEST_ADDRESS_1);

        vm.warp(1681650001);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);

        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );

        vm.stopPrank();

        vm.warp(1681670001);
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(TEST_ADDRESS_1, 2);
    }

    // 1 proposal at 1 vote; release to voter of rank 2; revert with error message
    function testReleaseToVoterSecondPlace1WithERC20() public {
        vm.startPrank(TEST_ADDRESS_1);

        vm.warp(1681650001);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);

        vm.warp(1681660001);
        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );

        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 2);
    }

    //// 1 PROPOSAL WITH 2 VOTERS

    // 1 proposal with 2 voters; release to voters of rank 1
    function testReleaseToVotersFirstPlace1WithNative() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );
        vm.stopPrank();

        vm.deal(address(TEST_ADDRESS_2), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_1, 1);
        voterRewardsModule.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 45000000000000);
    }

    // 1 proposal with 2 voters; release to voters of rank 1
    function testReleaseToVotersFirstPlace1WithERC20() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 1 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId, 1 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 1);
        voterRewardsModule.release(testERC20, TEST_ADDRESS_2, 1);

        assertEq(testERC20.balanceOf(TEST_ADDRESS_1), 25);
        assertEq(testERC20.balanceOf(TEST_ADDRESS_2), 25);
    }

    //// 2 PROPOSALS

    // 2 proposals, at 1 and 5 votes; release to voter of rank 1
    function testReleaseToVoterFirstPlace2WithNative() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 5 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 270000000000000);
    }

    // 2 proposals, at 1 and 5 votes; release to voter of rank 1
    function testReleaseToVoterFirstPlace2WithERC20() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 5 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        voterRewardsModule.release(testERC20, TEST_ADDRESS_2, 1);

        assertEq(testERC20.balanceOf(TEST_ADDRESS_2), 50);
    }

    /////////////////////////////

    // TIES

    //// 2 PROPOSALS

    // 2 proposals, both at 1 vote; send back to creator
    function testFirstPlaceTieWithNative() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.prank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );

        vm.deal(address(TEST_ADDRESS_2), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.prank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_1, 1);

        assertEq(CREATOR_ADDRESS.balance, 90000000000000);
    }

    // 2 proposals, both at 1 vote; send back to creator
    function testFirstPlaceTieWithERC20() public {
        vm.warp(1681650001);

        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.prank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );

        vm.deal(address(TEST_ADDRESS_2), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.prank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 1);

        assertEq(testERC20.balanceOf(CREATOR_ADDRESS), 50);
    }

    // 2 proposals, both at 0 votes; reverted
    function testFirstPlaceTieWithZeroVotesWithNative() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681670001);
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(TEST_ADDRESS_1, 1);
    }

    // 2 proposals, both at 0 votes; reverted
    function testFirstPlaceTieWithZeroVotesWithERC20() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 1);
    }

    // 2 proposals, both at 0 votes; release 2nd place; reverted
    function testSecondPlaceTieWithZeroVotesWithNative() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681670001);
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(TEST_ADDRESS_1, 2);
    }

    // 2 proposals, both at 0 votes; release 2nd place; reverted
    function testSecondPlaceTieWithZeroVotesWithERC20() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 2);
    }

    //// 3 PROPOSALS

    // 3 proposals, 1 at 3 votes and 2 at 1 vote; send back to creator
    function testSecondPlaceTieWithNative() public {
        vm.warp(1681650001);

        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        uint256 proposalId3 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal3);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 5 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 3 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 3 ether
        );
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId3, 1 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_1, 2);

        assertEq(CREATOR_ADDRESS.balance, 150000000000000);
    }

    // 3 proposals, 1 at 3 votes and 2 at 1 vote; send back to creator
    function testSecondPlaceTieWithERC20() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        uint256 proposalId3 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal3);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 5 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 3 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 3 ether
        );
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId3, 1 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 2);

        assertEq(testERC20.balanceOf(CREATOR_ADDRESS), 33);
    }

    //// 4 PROPOSALS

    // 4 proposals, 1 at 3 votes and 2 at 2 votes, and 1 at 1 vote; send back to creator
    function testSecondPlaceTiePayOutThirdPlaceWithNative() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        uint256 proposalId3 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal3);
        uint256 proposalId4 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal4);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 8 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 3 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 3 ether
        );
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 2 ether
        );
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId3, 2 ether
        );
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId4, 1 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_1, 3);

        assertEq(CREATOR_ADDRESS.balance, 120000000000000);
    }

    // 4 proposals from 2 different authors, 1 at 3 votes and 2 at 2 votes, and 1 at 1 vote; send back to creator
    function testSecondPlaceTiePayOutThirdPlaceWithERC20() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        uint256 proposalId3 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal3);
        uint256 proposalId4 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal4);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 8 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 3 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 3 ether
        );
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 2 ether
        );
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId3, 2 ether
        );
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId4, 1 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        testERC20.transfer(address(voterRewardsModule), 100); // give the rewards module ERC20 to pay out
        voterRewardsModule.release(testERC20, TEST_ADDRESS_1, 3);

        assertEq(testERC20.balanceOf(CREATOR_ADDRESS), 16);
    }

    /////////////////////////////

    // NO PROPOSALS

    // No proposals; revert with error message
    function testFirstPlaceTieWithZeroProposalsWithNative() public {
        vm.warp(1681670001);
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(CREATOR_ADDRESS, 1);
    }

    // No proposals; revert with error message
    function testFirstPlaceTieWithZeroProposalsWithERC20() public {
        vm.warp(1681670001);
        vm.prank(CREATOR_ADDRESS);
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModule.release(testERC20, CREATOR_ADDRESS, 1);
    }

    /////////////////////////////

    // SORTING OLD VALUE TESTING (TESTING SORTING ALGORITHM)

    // Old value is at inserting index
    function testReleaseToVoterFirstPlaceOldValueAtInsertingIndex() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 7 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 2 ether
        );
        payPerVoteExpCurveContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 360000000000000);
    }

    // Old value is at inserting index and is only value in array
    function testReleaseToVoterFirstPlaceOldValueAtInsertingIndexOnlyValue() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 7 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 2 ether
        );
        payPerVoteExpCurveContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_1, 1);

        assertEq(TEST_ADDRESS_1.balance, 315000000000000);
    }

    // Old value is after inserting index and in array
    function testReleaseToVoterFirstPlaceOldValueAfterInserting() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 2 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 2 ether
        );
        vm.stopPrank();

        vm.deal(address(TEST_ADDRESS_2), 6 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );
        payPerVoteExpCurveContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 360000000000000);
    }

    // Old value is at inserting index and tied
    function testReleaseToVoterFirstPlaceOldValueAtInsertingIndexAndTied() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 6 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );
        payPerVoteExpCurveContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 315000000000000);
    }

    // Old value is after inserting index, in array, and tied
    function testReleaseToVoterFirstPlaceOldValueAfterInsertingAndTied() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal2);
        uint256 proposalId3 = payPerVoteExpCurveContest.propose(testAddress1AuthorProposal3);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 3 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 4 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 2 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId3, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveContest.castVote{value: 3 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 3 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModule.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 315000000000000);
    }

    /////////////////////////////

    // RELEASES WITH RANK LIMIT OF ONE (TESTING SORTING ALGORITHM)

    // 2 proposals, different authors, at 1 and 5 votes, on contest with rank limit of 1 - array already at limit, release to author of rank 1
    function testReleaseToVoterFirstPlaceRankLimit1() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveRankLimitOneContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveRankLimitOneContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 1 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.deal(address(TEST_ADDRESS_2), 5 * payPerVoteExpCurveContest.currentPricePerVote());

        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        vm.stopPrank();

        vm.startPrank(TEST_ADDRESS_2);
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModuleToRankLimitOneContest.release(TEST_ADDRESS_2, 1);

        assertEq(TEST_ADDRESS_2.balance, 270000000000000);
    }

    // 2 proposals, different authors, at 1 and 5 votes, on contest with rank limit of 1 - array already at limit, release to author of rank 2 - should error
    function testReleaseToVoterSecondPlaceRankLimit1() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveRankLimitOneContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveRankLimitOneContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 6 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        vm.expectRevert(abi.encodeWithSelector(GovernorCountingSimple.RankIsNotInSortedRanks.selector));
        voterRewardsModuleToRankLimitOneContest.release(TEST_ADDRESS_2, 2);
    }

    // Old value is after inserting index and in array and at limit
    function testReleaseToVoterFirstPlaceOldValueInArrayAfterInsertingAtLimit() public {
        vm.warp(1681650001);
        vm.startPrank(TEST_ADDRESS_1);
        uint256 proposalId1 = payPerVoteExpCurveRankLimitOneContest.propose(testAddress1AuthorProposal1);
        uint256 proposalId2 = payPerVoteExpCurveRankLimitOneContest.propose(testAddress1AuthorProposal2);
        vm.stopPrank();

        vm.warp(1681660001);

        vm.deal(address(TEST_ADDRESS_1), 8 * payPerVoteExpCurveContest.currentPricePerVote());
        vm.startPrank(TEST_ADDRESS_1);
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 1 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 1 ether
        );
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 2 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId2, 2 ether
        );
        payPerVoteExpCurveRankLimitOneContest.castVote{value: 5 * payPerVoteExpCurveContest.currentPricePerVote()}(
            proposalId1, 5 ether
        );
        vm.stopPrank();

        vm.warp(1681670001);
        voterRewardsModuleToRankLimitOneContest.release(TEST_ADDRESS_1, 1);

        assertEq(TEST_ADDRESS_1.balance, 360000000000000);
    }

    /////////////////////////////
}
