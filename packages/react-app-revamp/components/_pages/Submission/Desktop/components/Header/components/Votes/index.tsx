import { formatNumberAbbreviated } from "@helpers/formatNumber";
import { ordinalize } from "@helpers/ordinalize";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import useProposalVotes from "@hooks/useProposalVotes";
import { useShallow } from "zustand/shallow";
import AnimatedVoteText from "./components/AnimatedVoteText";

const SubmissionPageDesktopVotes = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const { votes, rank, isTied, isLoading, isError } = useProposalVotes({
    contestAddress: contestConfig.address,
    proposalId: proposalId,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });

  if (isLoading) {
    return (
      <div className="w-40 h-8 bg-neutral-16 border border-positive-13 rounded-2xl flex items-center justify-center">
        <span className="text-positive-14 text-base font-bold">loading...</span>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  if (votes === 0 && rank === 0) {
    return null;
  }

  return (
    <div className="h-8 bg-neutral-16 border border-positive-13 rounded-2xl flex items-center justify-center px-4">
      <AnimatedVoteText votes={votes}>
        {rank > 0 ? (
          <>
            <span className="text-base">
              {rank}
              <sup>{ordinalize(rank).suffix}</sup> place {isTied ? "(tied)" : ""}
            </span>
            <span className="text-base"> | </span>
            <span className="text-xs">
              {formatNumberAbbreviated(votes)} {votes === 1 ? "vote" : "votes"}
            </span>
          </>
        ) : (
          <span className="text-xs">
            {formatNumberAbbreviated(votes)} {votes === 1 ? "vote" : "votes"}
          </span>
        )}
      </AnimatedVoteText>
    </div>
  );
};

export default SubmissionPageDesktopVotes;
