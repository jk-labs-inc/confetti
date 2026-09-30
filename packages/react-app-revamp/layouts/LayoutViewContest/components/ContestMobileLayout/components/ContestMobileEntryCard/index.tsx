import ListProposals from "@components/_pages/ListProposals";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useIsStandalonePwa } from "@hooks/useIsStandalonePwa";
import { FC } from "react";
import { useEntriesReady } from "../../../../hooks/useEntriesReady";

const ContestMobileEntryCard: FC = () => {
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const isCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;
  const isStandalonePwa = useIsStandalonePwa();
  const isReady = useEntriesReady();
  const hasVotingBar = isVotingOpen && !isCanceled;
  const bottomSpacing = hasVotingBar ? "pb-12" : isStandalonePwa ? "mb-12" : "";

  return (
    <div className={bottomSpacing}>
      {isReady && (
        <div className="animate-fade-in">
          <ListProposals />
        </div>
      )}
    </div>
  );
};

export default ContestMobileEntryCard;
