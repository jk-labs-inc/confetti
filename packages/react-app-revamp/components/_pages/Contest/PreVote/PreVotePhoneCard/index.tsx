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

const PreVotePhoneCard: FC = () => {
  const pool = useContestPoolDisplay();
  const { contestName, votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ contestName: state.contestName, votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const { contestAddress, chainName } = useContestConfigStore(
    useShallow(state => ({ contestAddress: state.contestConfig.address, chainName: state.contestConfig.chainName })),
  );

  return (
    <section className="flex flex-col gap-3.5 rounded-[20px] border border-neutral-5 bg-primary-13 p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
        <PreVoteCountdown />
        {pool.status !== "empty" && (
          <ScaleToFit>
            {pool.status === "loading" ? (
              <RewardsStickerSkeleton size="stat" />
            ) : (
              <RewardsSticker size="stat" items={pool.tokenItems} chainName={pool.chainName} phase={pool.phase} />
            )}
          </ScaleToFit>
        )}
      </div>
      <ContestNotifyButton
        contestName={contestName}
        contestAddress={contestAddress}
        chainName={chainName}
        votesOpen={votesOpen}
        votesClose={votesClose}
        variant="button"
        label="remind me when voting opens"
      />
    </section>
  );
};

export default PreVotePhoneCard;
