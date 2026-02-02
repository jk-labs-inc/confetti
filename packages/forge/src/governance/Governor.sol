// SPDX-License-Identifier: AGPL-3.0-only
// Forked from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/Governor.sol
pragma solidity ^0.8.19;

import "@openzeppelin/utils/math/SafeCast.sol";
import "@openzeppelin/utils/Address.sol";
import {UD60x18, ud} from "@prb/math/src/UD60x18.sol";
import "./utils/GovernorSorting.sol";

/**
 * @dev Core of the governance system, designed to be extended though various modules.
 */
abstract contract Governor is GovernorSorting {
    using SafeCast for uint256;

    enum ContestState {
        NotStarted,
        Active,
        Canceled,
        Queued,
        Completed
    }

    enum Metadatas {
        Target,
        Safe,
        Fields
    }

    enum Actions {
        Submit,
        Vote
    }

    enum PriceCurveTypes {
        Exponential
    }

    struct IntConstructorArgs {
        uint256 anyoneCanSubmit;
        uint256 contestStart;
        uint256 votingDelay;
        uint256 votingPeriod;
        uint256 numAllowedProposalSubmissions;
        uint256 maxProposalCount;
        uint256 sortingEnabled;
        uint256 rankLimit;
        uint256 percentageToRewards;
        uint256 costToVote;
        uint256 priceCurveType;
        uint256 multiple;
        uint256 creatorSplitEnabled;
    }

    struct ConstructorArgs {
        string name;
        string prompt;
        IntConstructorArgs intConstructorArgs;
        address jkLabsSplitDestination;
        string metadataFieldsSchema;
    }

    struct TargetMetadata {
        address targetAddress;
    }

    struct SafeMetadata {
        address[] signers;
        uint256 threshold;
    }

    struct FieldsMetadata {
        // all of these have max length of MAX_FIELDS_METADATA_LENGTH as enforced in validateProposalData()
        address[] addressArray;
        string[] stringArray;
        uint256[] uintArray;
    }

    struct ProposalCore {
        address author;
        bool exists;
        string description;
        TargetMetadata targetMetadata;
        SafeMetadata safeMetadata;
        FieldsMetadata fieldsMetadata;
    }

    event JokeraceCreated(
        string version,
        string name,
        string prompt,
        address creator,
        uint256 contestStart,
        uint256 votingDelay,
        uint256 votingPeriod
    );
    event ProposalCreated(uint256 proposalId, address proposer, string proposalDescription);
    event ProposalsDeleted(uint256[] proposalIds);
    event ContestCanceled();
    event VoteCast(address indexed voter, uint256 proposalId, uint256 numVotes);
    event RewardsPaymentReleased(address to, uint256 amount);
    event JkLabsPaymentReleased(address to, uint256 amount);
    event CreatorPaymentReleased(address to, uint256 amount);

    uint256 public constant METADATAS_COUNT = uint256(type(Metadatas).max) + 1;
    uint256 public constant MAX_FIELDS_METADATA_LENGTH = 10;
    uint256 public constant AMOUNT_FOR_SUMBITTER_PROOF = 10000000000000000000;
    address public constant JK_LABS_ADDRESS = 0xDc652C746A8F85e18Ce632d97c6118e8a52fa738; // Our hot wallet that we collect revenue to.
    uint256 public constant PRICE_CURVE_UPDATE_INTERVAL = 60; // How often the price curve updates if applicable.
    uint256 public constant COST_ROUNDING_VALUE = 1e12; // Used for rounding costs, means cost to propose or vote can't be less than 1e18/this.
    string private constant VERSION = "6.12"; // Private as to not clutter the ABI.

    string public name; // The title of the contest
    string public prompt;
    address public creator;
    uint256 public anyoneCanSubmit; // If 1, anyone can submit; if 0, only creator can submit.
    uint256 public contestStart; // The Unix timestamp that the contest starts at.
    uint256 public votingDelay; // Number of seconds that submissions are open.
    uint256 public votingPeriod; // Number of seconds that voting is open.
    uint256 public numAllowedProposalSubmissions; // The number of proposals that an address who is qualified to propose can submit for this contest.
    uint256 public maxProposalCount; // Max number of proposals allowed in this contest.
    uint256 public percentageToRewards;
    uint256 public costToVote; // Starting/minimum price
    uint256 public priceCurveType; // Enum value of PriceCurveTypes.
    uint256 public multiple; // Exponent multiple for an exponential price curve if applicable.
    uint256 public creatorSplitEnabled; // If 1, half of the jk labs split is sent to the creator; if 0, none of it is.
    address public jkLabsSplitDestination; // Where the jk labs split of revenue goes.
    string public metadataFieldsSchema; // JSON Schema of what the metadata fields are.

    uint256[] public proposalIds;
    uint256[] public deletedProposalIds;
    mapping(uint256 => bool) public proposalIsDeleted;
    bool public canceled;
    mapping(uint256 => ProposalCore) public proposals;
    mapping(address => uint256) public numSubmissions;
    address[] public proposalAuthors;
    address[] public addressesThatHaveVoted;

    error AuthorIsNotSender(address author, address sender);
    error ZeroSignersInSafeMetadata();
    error ZeroThresholdInSafeMetadata();
    error AddressFieldMetadataArrayTooLong();
    error StringFieldMetadataArrayTooLong();
    error UintFieldMetadataArrayTooLong();
    error UnexpectedMetadata(Metadatas unexpectedMetadata);
    error EmptyProposalDescription();

    error IncorrectCostSent(uint256 msgValue, uint256 costToVote);

    error OnlyCreatorCanSubmit();
    error ContestMustBeQueuedToPropose();
    error OfficialModuleMustBeSetToEnter();
    error ContestMustBeActiveToVote();
    error ContestMustBeActiveToGetCurrentVotePrice();
    error SenderSubmissionLimitReached(uint256 numAllowedProposalSubmissions);
    error ContestSubmissionLimitReached(uint256 maxProposalCount);
    error DuplicateSubmission(uint256 proposalId);

    error CannotVoteOnDeletedProposal();
    error NeedAtLeastOneVoteToVote();
    error CannotVoteLessThanOneVoteInPayPerVote();

    error OnlyCreatorOrEntrantCanDelete();
    error OnlyCreatorCanSetName();
    error OnlyCreatorCanSetPrompt();
    error CanOnlyDeleteWhenQueued();
    error CannotSetWhenCompletedOrCanceled();

    error OnlyCreatorOrJkLabsCanCancel();
    error CanOnlyCancelBeforeFirstVote();
    error ContestAlreadyCanceled();

    error CannotUpdateWhenCompletedOrCanceled();

    error OnlyJkLabsCanAmend();
    error OnlyCreatorCanAmend();

    constructor(ConstructorArgs memory constructorArgs_) {
        name = constructorArgs_.name;
        prompt = constructorArgs_.prompt;
        anyoneCanSubmit = constructorArgs_.intConstructorArgs.anyoneCanSubmit;
        creator = msg.sender;
        contestStart = constructorArgs_.intConstructorArgs.contestStart;
        votingDelay = constructorArgs_.intConstructorArgs.votingDelay;
        votingPeriod = constructorArgs_.intConstructorArgs.votingPeriod;
        numAllowedProposalSubmissions = constructorArgs_.intConstructorArgs.numAllowedProposalSubmissions;
        maxProposalCount = constructorArgs_.intConstructorArgs.maxProposalCount;
        percentageToRewards = constructorArgs_.intConstructorArgs.percentageToRewards;
        costToVote = constructorArgs_.intConstructorArgs.costToVote;
        priceCurveType = constructorArgs_.intConstructorArgs.priceCurveType;
        multiple = constructorArgs_.intConstructorArgs.multiple;
        creatorSplitEnabled = constructorArgs_.intConstructorArgs.creatorSplitEnabled;
        jkLabsSplitDestination = constructorArgs_.jkLabsSplitDestination;
        metadataFieldsSchema = constructorArgs_.metadataFieldsSchema;

        emit JokeraceCreated(VERSION, name, prompt, creator, contestStart, votingDelay, votingPeriod); // emit upon creation to be able to easily find jokeraces on a chain
    }

    function version() public pure returns (string memory) {
        return VERSION;
    }

    function hashProposal(ProposalCore memory proposal) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(proposal)));
    }

    function state() public view returns (ContestState) {
        if (canceled) {
            return ContestState.Canceled;
        }

        if (contestStart >= block.timestamp) {
            return ContestState.NotStarted;
        }

        if (voteStart() >= block.timestamp) {
            return ContestState.Queued;
        }

        if (contestDeadline() >= block.timestamp) {
            return ContestState.Active;
        }

        return ContestState.Completed;
    }

    /**
     * @dev Return all proposals.
     */
    function getAllProposalIds() public view returns (uint256[] memory) {
        return proposalIds;
    }

    /**
     * @dev Return all proposal authors.
     */
    function getAllProposalAuthors() public view returns (address[] memory) {
        return proposalAuthors;
    }

    /**
     * @dev Return all addresses that have voted.
     */
    function getAllAddressesThatHaveVoted() public view returns (address[] memory) {
        return addressesThatHaveVoted;
    }

    /**
     * @dev Return all deleted proposals.
     */
    function getAllDeletedProposalIds() public view returns (uint256[] memory) {
        return deletedProposalIds;
    }

    /**
     * @dev Return all authors of deleted proposals.
     */
    function getAllAuthorsOfDeletedProposals() public view returns (address[] memory) {
        uint256[] memory deletedProposalIdsMemVar = deletedProposalIds;
        address[] memory authorsArray = new address[](deletedProposalIdsMemVar.length);
        for (uint256 i = 0; i < deletedProposalIdsMemVar.length; i++) {
            authorsArray[i] = proposals[deletedProposalIdsMemVar[i]].author;
        }
        return authorsArray;
    }

    /**
     * @dev Timestamp the contest vote begins. Votes open at the end of this block, so it is possible to propose
     * during this block.
     */
    function voteStart() public view returns (uint256) {
        return contestStart + votingDelay;
    }

    /**
     * @dev Timestamp the contest vote ends. Votes close at the end of this block, so it is not possible to vote in a block with a timestamp after this.
     */
    function contestDeadline() public view returns (uint256) {
        return voteStart() + votingPeriod;
    }

    /**
     * @dev Retrieve proposal data.
     */
    function getProposal(uint256 proposalId) public view returns (ProposalCore memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Set the contest name.
     */
    function setName(string memory newName) public returns (string memory) {
        if (msg.sender != creator) revert OnlyCreatorCanSetName();
        if (state() == ContestState.Completed || state() == ContestState.Canceled) {
            revert CannotSetWhenCompletedOrCanceled();
        }

        name = newName;
        return newName;
    }

    /**
     * @dev Set the contest prompt.
     */
    function setPrompt(string memory newPrompt) public returns (string memory) {
        if (msg.sender != creator) revert OnlyCreatorCanSetPrompt();
        if (state() == ContestState.Completed || state() == ContestState.Canceled) {
            revert CannotSetWhenCompletedOrCanceled();
        }

        prompt = newPrompt;
        return newPrompt;
    }

    /**
     * @dev Returns true if totalVotesCast is zero.
     */
    function totalVotesCastIsZero() public virtual returns (bool totalVotesCastZero);

    /**
     * @dev Returns the official rewards module.
     */
    function _getOfficialRewardsModule() internal view virtual returns (address officialRewardsModule);

    /**
     * @dev Register a vote with a given support and voting weight.
     */
    function _countVote(uint256 proposalId, address account, uint256 numVotes) internal virtual;

    /**
     * @dev Verifies that `account` is permissioned to propose.
     */
    function verifyProposer() public view {
        if ((anyoneCanSubmit != 1) && (msg.sender != creator)) revert OnlyCreatorCanSubmit();
    }

    /**
     * @dev Confirms that all of the metadata in the proposal is valid.
     */
    function validateProposalData(ProposalCore memory proposal) public view {
        if (proposal.author != msg.sender) revert AuthorIsNotSender(proposal.author, msg.sender);
        for (uint256 index = 0; index < METADATAS_COUNT; index++) {
            Metadatas currentMetadata = Metadatas(index);
            if (currentMetadata == Metadatas.Target) {
                continue; // nothing to check here since strictly typed to address
            } else if (currentMetadata == Metadatas.Safe) {
                if (proposal.safeMetadata.signers.length == 0) revert ZeroSignersInSafeMetadata();
                if (proposal.safeMetadata.threshold == 0) revert ZeroThresholdInSafeMetadata();
            } else if (currentMetadata == Metadatas.Fields) {
                if (proposal.fieldsMetadata.addressArray.length > MAX_FIELDS_METADATA_LENGTH) {
                    revert AddressFieldMetadataArrayTooLong();
                }
                if (proposal.fieldsMetadata.stringArray.length > MAX_FIELDS_METADATA_LENGTH) {
                    revert StringFieldMetadataArrayTooLong();
                }
                if (proposal.fieldsMetadata.uintArray.length > MAX_FIELDS_METADATA_LENGTH) {
                    revert UintFieldMetadataArrayTooLong();
                }
            } else {
                revert UnexpectedMetadata(currentMetadata);
            }
        }
        if (bytes(proposal.description).length == 0) revert EmptyProposalDescription();
    }

    /**
     * @dev Returns the current cost per vote.
     */
    function currentPricePerVote() public view returns (uint256) {
        if (state() != ContestState.Active) revert ContestMustBeActiveToGetCurrentVotePrice();

        if (PriceCurveTypes(priceCurveType) == PriceCurveTypes.Exponential) {
            uint256 currentInterval = (block.timestamp - (voteStart() + 1)) / PRICE_CURVE_UPDATE_INTERVAL; // voteStart is the last block that one can enter, so voting period is exclusive of it, hence the plus 1
            UD60x18 percentThroughVotingPeriod = (
                ud(currentInterval * 1e18) / (ud(votingPeriod * 1e18) / ud(PRICE_CURVE_UPDATE_INTERVAL * 1e18))
            ) * ud(100 * 1e18); // percentage as whole number so curve is 0 to 100
            UD60x18 exponent = percentThroughVotingPeriod * (ud(multiple) / ud(1e18));
            UD60x18 curveMultiple = exponent.exp2();
            uint256 result = ((ud(costToVote) / ud(1e18)) * curveMultiple).intoUint256(); // costToVote is the minimum cost per vote for exponential curves
            return (result / COST_ROUNDING_VALUE) * COST_ROUNDING_VALUE; // round to keep things clean on frontend
        } else {
            return costToVote;
        }
    }

    /**
     * @dev Determines that the correct amount was sent with the transaction and returns that correct amount.
     */
    function _determineCorrectAmountSent(Actions currentAction, uint256 numVotes) internal returns (uint256) {
        uint256 actionCost;
        if (currentAction == Actions.Vote) {
            if (numVotes < 1 ether) revert CannotVoteLessThanOneVoteInPayPerVote();
            actionCost = currentPricePerVote() * (numVotes / 1 ether); // we don't allow <1 vote to be cast bc this would underflow
        } else {
            actionCost = 0;
        }

        if (msg.value != actionCost) revert IncorrectCostSent(msg.value, actionCost);
        return actionCost;
    }

    /**
     * @dev Distribute the cost of an action to the rewards pool, jk labs, and creator if applicable based on percentageToRewards and creatorSplitEnabled.
     */
    function _distributeCost(uint256 actionCost) internal {
        if (actionCost > 0) {
            // Send cost to rewards pool and jk labs split destinations, as well as creator if applicable
            uint256 sendingToJkLabs = (msg.value * (100 - percentageToRewards)) / 100;
            if (sendingToJkLabs > 0) {
                uint256 sendingToCreator = (creatorSplitEnabled == 1) ? (sendingToJkLabs / 2) : 0;
                if (sendingToCreator > 0) {
                    Address.sendValue(payable(creator), sendingToCreator);
                    emit CreatorPaymentReleased(creator, sendingToCreator);
                }

                Address.sendValue(payable(jkLabsSplitDestination), sendingToJkLabs - sendingToCreator);
                emit JkLabsPaymentReleased(jkLabsSplitDestination, sendingToJkLabs - sendingToCreator);
            }

            uint256 sendingToRewards = msg.value - sendingToJkLabs;
            if (sendingToRewards > 0) {
                Address.sendValue(payable(_getOfficialRewardsModule()), sendingToRewards); // rewards pool gets the extra wei in the case of rounding
                emit RewardsPaymentReleased(_getOfficialRewardsModule(), sendingToRewards);
            }
        }
    }

    /**
     * @dev Create a new proposal.
     */
    function propose(ProposalCore calldata proposal) public payable returns (uint256) {
        uint256 actionCost = _determineCorrectAmountSent(Actions.Submit, 0);

        if (_getOfficialRewardsModule() == address(0)) revert OfficialModuleMustBeSetToEnter();
        verifyProposer();
        validateProposalData(proposal);
        uint256 proposalId = _castProposal(proposal);

        _distributeCost(actionCost);

        return proposalId;
    }

    function _castProposal(ProposalCore memory proposal) internal returns (uint256) {
        if (state() != ContestState.Queued) revert ContestMustBeQueuedToPropose();
        if (numSubmissions[msg.sender] == numAllowedProposalSubmissions) {
            revert SenderSubmissionLimitReached(numAllowedProposalSubmissions);
        }
        if ((proposalIds.length - deletedProposalIds.length) == maxProposalCount) {
            revert ContestSubmissionLimitReached(maxProposalCount);
        }

        uint256 proposalId = hashProposal(proposal);
        if (proposals[proposalId].exists) revert DuplicateSubmission(proposalId);

        proposalIds.push(proposalId);
        proposals[proposalId] = proposal;
        numSubmissions[msg.sender] += 1;
        proposalAuthors.push(msg.sender);

        emit ProposalCreated(proposalId, msg.sender, proposal.description);

        return proposalId;
    }

    /**
     * @dev Delete proposals.
     *
     * Emits a {IGovernor-ProposalsDeleted} event.
     */
    function deleteProposals(uint256[] calldata proposalIdsToDelete) public {
        if (state() != ContestState.Queued) {
            revert CanOnlyDeleteWhenQueued();
        }

        for (uint256 index = 0; index < proposalIdsToDelete.length; index++) {
            uint256 currentProposalId = proposalIdsToDelete[index];
            if ((msg.sender != creator) && (msg.sender != proposals[currentProposalId].author)) {
                revert OnlyCreatorOrEntrantCanDelete();
            }
            if (!proposalIsDeleted[currentProposalId]) {
                // if this proposal hasn't already been deleted
                proposalIsDeleted[currentProposalId] = true;
                // this proposal now won't count towards the total number allowed in the contest
                // it will still count towards the total number of proposals that the user is allowed to submit though
                deletedProposalIds.push(currentProposalId);
            }
        }

        emit ProposalsDeleted(proposalIds);
    }

    /**
     * @dev Cancels the contest.
     *
     * Emits a {IGovernor-ContestCanceled} event.
     */
    function cancel() public {
        if ((msg.sender != creator) && (msg.sender != JK_LABS_ADDRESS)) revert OnlyCreatorOrJkLabsCanCancel();
        if (canceled) revert ContestAlreadyCanceled();

        if (totalVotesCastIsZero() != true) {
            revert CanOnlyCancelBeforeFirstVote();
        }

        canceled = true;

        emit ContestCanceled();
    }

    /**
     * @dev Cast a vote.
     */
    function castVote(uint256 proposalId, uint256 numVotes) public payable returns (uint256) {
        uint256 actionCost = _determineCorrectAmountSent(Actions.Vote, numVotes);

        if (proposalIsDeleted[proposalId]) revert CannotVoteOnDeletedProposal();

        _distributeCost(actionCost);

        return _castVote(proposalId, msg.sender, numVotes);
    }

    /**
     * @dev Internal vote casting mechanism: Check that the vote is pending, that it has not been cast yet,
     * and call the {_countVote} internal function.
     *
     * Emits a {IGovernor-VoteCast} event.
     */
    function _castVote(uint256 proposalId, address account, uint256 numVotes) internal returns (uint256) {
        if (state() != ContestState.Active) revert ContestMustBeActiveToVote();
        if (numVotes == 0) revert NeedAtLeastOneVoteToVote();

        _countVote(proposalId, account, numVotes);

        addressesThatHaveVoted.push(msg.sender);

        emit VoteCast(account, proposalId, numVotes);

        return numVotes;
    }

    function setJkLabsSplitDestination(address newJkLabsSplitDestination) public {
        if (msg.sender != JK_LABS_ADDRESS) revert OnlyJkLabsCanAmend();
        if (state() == ContestState.Completed || state() == ContestState.Canceled) {
            revert CannotUpdateWhenCompletedOrCanceled();
        }
        jkLabsSplitDestination = newJkLabsSplitDestination;
    }
}
