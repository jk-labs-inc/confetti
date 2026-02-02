// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.19;

import "../Governor.sol";

/**
 * @dev Extension of {Governor} for engagement features.
 */
abstract contract GovernorEngagement is Governor {
    struct CommentCore {
        address author;
        uint256 timestamp;
        uint256 proposalId;
        string commentContent;
    }

    event CommentCreated(uint256 commentId);
    event CommentsDeleted(uint256[] commentIds);

    uint256[] public commentIds;
    uint256[] public deletedCommentIds;
    mapping(uint256 => CommentCore) public comments;
    mapping(uint256 => uint256[]) public proposalComments;
    mapping(uint256 => bool) public commentIsDeleted;

    error OnlyCreatorOrAuthorCanDeleteComments(uint256 failedToDeleteCommentId);
    error CannotCommentWhenCompletedOrCanceled();
    error CannotDeleteWhenCompletedOrCanceled();

    /**
     * @dev Hashing function used to build the comment id from the comment details.
     */
    function hashComment(CommentCore memory commentObj) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(commentObj)));
    }

    /**
     * @dev Return all commentIds.
     */
    function getAllCommentIds() public view returns (uint256[] memory) {
        return commentIds;
    }

    /**
     * @dev Return all deleted commentIds.
     */
    function getAllDeletedCommentIds() public view returns (uint256[] memory) {
        return deletedCommentIds;
    }

    /**
     * @dev Return a comment object.
     */
    function getComment(uint256 commentId) public view returns (CommentCore memory) {
        return comments[commentId];
    }

    /**
     * @dev Return the array of commentIds on a given proposalId.
     */
    function getProposalComments(uint256 proposalId) public view returns (uint256[] memory) {
        return proposalComments[proposalId];
    }

    /**
     * @dev Comment on a proposal.
     *
     * Emits a {CommentCreated} event.
     */
    function comment(uint256 proposalId, string memory commentContent) public returns (uint256) {
        if (state() == ContestState.Completed || state() == ContestState.Canceled) {
            revert CannotCommentWhenCompletedOrCanceled();
        }

        CommentCore memory commentObject = CommentCore({
            author: msg.sender, timestamp: block.timestamp, proposalId: proposalId, commentContent: commentContent
        });
        uint256 commentId = hashComment(commentObject);

        commentIds.push(commentId);
        comments[commentId] = commentObject;
        proposalComments[proposalId].push(commentId);

        emit CommentCreated(commentId);

        return commentId;
    }

    /**
     * @dev Delete comments.
     *
     * Emits a {CommentsDeleted} event.
     */
    function deleteComments(uint256[] memory commentIdsParam) public {
        if (state() == ContestState.Completed || state() == ContestState.Canceled) {
            revert CannotDeleteWhenCompletedOrCanceled();
        }

        uint256 commentIdsParamMemVar = commentIdsParam.length;

        for (uint256 index = 0; index < commentIdsParamMemVar; index++) {
            uint256 currentCommentId = commentIdsParam[index];

            if ((msg.sender != creator) && (msg.sender != comments[currentCommentId].author)) {
                revert OnlyCreatorOrAuthorCanDeleteComments(currentCommentId);
            }

            if (!commentIsDeleted[currentCommentId]) {
                commentIsDeleted[currentCommentId] = true;
                deletedCommentIds.push(currentCommentId);
            }
        }

        emit CommentsDeleted(commentIdsParam);
    }
}
