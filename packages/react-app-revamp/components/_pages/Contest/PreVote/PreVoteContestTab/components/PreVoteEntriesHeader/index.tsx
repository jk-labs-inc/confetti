import { useContestStore } from "@hooks/useContest/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC } from "react";
import PreVoteSubmit from "./components/PreVoteSubmit";

const getEntriesLabel = (count: number): string => {
  if (count === 0) return "no entries yet";
  return count === 1 ? "1 entry" : `${count} entries`;
};

const getSpotsLabel = (spotsLeft: number): string => {
  if (spotsLeft <= 0) return "no spots left";
  return spotsLeft === 1 ? "1 spot left" : `${spotsLeft} spots left`;
};

const PreVoteEntriesHeader: FC = () => {
  const isSubmissionOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.SubmissionOpen;
  const submissionsCount = useProposalStore(state => state.submissionsCount);
  const contestMaxProposalCount = useContestStore(state => state.contestMaxProposalCount);

  if (!isSubmissionOpen && submissionsCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p className="flex items-baseline gap-2.5 whitespace-nowrap">
        <span className="text-[18px] font-bold text-neutral-11">{getEntriesLabel(submissionsCount)}</span>
        {contestMaxProposalCount > 0 && (
          <span className="text-[14px] text-neutral-9">{getSpotsLabel(contestMaxProposalCount - submissionsCount)}</span>
        )}
      </p>
      {isSubmissionOpen && <PreVoteSubmit />}
    </div>
  );
};

export default PreVoteEntriesHeader;
