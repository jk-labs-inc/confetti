import { chainsImages } from "@config/wagmi";
import { formatNumber } from "@helpers/formatNumber";
import { SubmissionWithContest } from "lib/user/types";
import { FC } from "react";

interface UserVotesListProps {
  submission: SubmissionWithContest;
  isLoading: boolean;
}

const UserVotesList: FC<UserVotesListProps> = ({ submission }) => {
  if (!submission.vote_amount) return null;

  return (
    <div className="flex items-center gap-6 border-t border-neutral-9 py-4 p-3 text-[16px]">
      <img src={chainsImages[submission.network_name]} width={32} height={32} alt={""} />
      <p>
        The user cast <span className="text-positive-11 font-bold">{formatNumber(submission.vote_amount)}</span> vote
        {submission.vote_amount > 1 ? "s" : ""} for Proposal {submission.proposal_id.slice(0, 5)} in the{" "}
        {submission.contest.title} contest.
      </p>
    </div>
  );
};

export default UserVotesList;
