import ContestProfitCard from "@components/_pages/Contest/Rewards/components/ProfitCard";
import { RewardModuleInfo } from "lib/rewards/types";
import { FC } from "react";
import RewardsSplitLayout from "../shared/Layout";
import VoterRewardsPageCreatorView from "./Creator";
import VoterRewardsPagePlayerView from "./Player";

interface VotersRewardsPageProps {
  contestAddress: `0x${string}`;
  chainId: number;
  rewards: RewardModuleInfo;
  version: string;
}

const VotersRewardsPage: FC<VotersRewardsPageProps> = ({ contestAddress, chainId, rewards, version }) => {
  return (
    <div className="flex flex-col gap-6 md:gap-16">
      <ContestProfitCard contestAddress={contestAddress} chainId={chainId} rewards={rewards} />
      <RewardsSplitLayout
        playerView={
          <VoterRewardsPagePlayerView
            rewards={rewards}
            contestAddress={contestAddress as `0x${string}`}
            chainId={chainId}
          />
        }
        creatorView={<VoterRewardsPageCreatorView rewards={rewards} chainId={chainId} version={version} />}
      />
    </div>
  );
};

export default VotersRewardsPage;
