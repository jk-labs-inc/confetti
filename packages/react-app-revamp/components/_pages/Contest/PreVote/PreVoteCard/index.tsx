import ContestNotifyButton from "@components/_pages/Contest/components/ContestNotifyButton";
import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import ScaleToFit from "@components/UI/ScaleToFit";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import PreVoteCountdown from "../components/PreVoteCountdown";

const PreVoteCard: FC = () => {
  const pool = useContestPoolDisplay();
  const { contestName, votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ contestName: state.contestName, votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const { contestAddress, chainName } = useContestConfigStore(
    useShallow(state => ({ contestAddress: state.contestConfig.address, chainName: state.contestConfig.chainName })),
  );

  return (
    <aside className="animate-fade-in sticky top-6 flex w-[360px] shrink-0 flex-col gap-4 rounded-[22px] border border-neutral-5 bg-primary-13 p-[22px]">
      {pool.status !== "empty" && (
        <>
          <div className="pb-3 pl-3 pt-4">
            <ScaleToFit>
              {pool.status === "loading" ? (
                <RewardsStickerSkeleton size="headline" />
              ) : (
                <RewardsSticker
                  size="headline"
                  items={pool.tokenItems}
                  chainName={pool.chainName}
                  phase={pool.phase}
                  audience={pool.audience}
                />
              )}
            </ScaleToFit>
          </div>
          <span aria-hidden="true" className="h-px bg-neutral-5" />
        </>
      )}
      <PreVoteCountdown />
      <ContestNotifyButton
        contestName={contestName}
        contestAddress={contestAddress}
        chainName={chainName}
        votesOpen={votesOpen}
        votesClose={votesClose}
        variant="button"
        className="mt-2"
        label="remind me when voting opens"
      />
    </aside>
  );
};

export default PreVoteCard;
