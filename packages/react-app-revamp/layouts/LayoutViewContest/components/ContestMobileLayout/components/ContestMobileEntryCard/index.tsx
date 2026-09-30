import ListProposals from "@components/_pages/ListProposals";
import { ENTRY_CAROUSEL_FOOTER_ID } from "@components/EntryCarousel/constants";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useIsStandalonePwa } from "@hooks/useIsStandalonePwa";
import { FC, ReactNode } from "react";
import { useEntriesReady } from "../../../../hooks/useEntriesReady";

interface ContestMobileEntryCardProps {
  footer?: ReactNode;
}

const ContestMobileEntryCard: FC<ContestMobileEntryCardProps> = ({ footer }) => {
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
          {footer ? (
            <div id={ENTRY_CAROUSEL_FOOTER_ID} className="mt-3">
              {footer}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ContestMobileEntryCard;
