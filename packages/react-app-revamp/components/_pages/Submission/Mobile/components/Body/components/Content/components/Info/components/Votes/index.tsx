import { formatNumberWithCommas } from "@helpers/formatNumber";
import ordinalize from "@helpers/ordinalize";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import useProposalVotes from "@hooks/useProposalVotes";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";

const SubmissionPageMobileBodyContentInfoVotes = () => {
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
      <div className="flex gap-2 items-center">
        <Skeleton width={100} height={16} baseColor="#6A6A6A" highlightColor="#BB65FF" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex gap-2 items-center">
        <p className="text-[16px] font-bold text-negative-11">
          ruh-roh! we were unable to fetch voters, please reload the page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {rank > 0 && (
        <>
          <p className="text-[16px] font-bold text-neutral-11">
            {ordinalize(rank).label} place {isTied ? "(tied)" : ""}
          </p>
          <span className="text-neutral-9">&#8226;</span>
        </>
      )}
      <p className="text-[16px] font-bold text-neutral-9">
        {formatNumberWithCommas(votes)} {votes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
};

export default SubmissionPageMobileBodyContentInfoVotes;
