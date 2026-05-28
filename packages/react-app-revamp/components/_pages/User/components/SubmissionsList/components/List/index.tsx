import { chainsImages } from "@config/wagmi";
import { SubmissionWithContest } from "lib/user/types";
import { FC } from "react";

interface UserSubmissionListProps {
  submission: SubmissionWithContest;
  isLoading: boolean;
}

const UserSubmissionList: FC<UserSubmissionListProps> = ({ submission }) => {
  return (
    <div className="flex items-center gap-6 border-t border-neutral-9 py-4 p-3 text-[16px]">
      <img src={chainsImages[submission.network_name]} width={32} height={32} alt={""} />
      <p>
        Entry {submission.proposal_id.slice(0, 5)} in the {submission.contest.title} contest
      </p>
    </div>
  );
};

export default UserSubmissionList;
