import { chains } from "@config/wagmi";
import { extractPathSegments } from "@helpers/extractPath";
import { useCancelRewards } from "@hooks/useCancelRewards";
import useRewardsModule from "@hooks/useRewards";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { Abi } from "viem";
import RewardsDisplay from "./components/RewardsDisplay";
import RewardsLoader from "./components/RewardsLoader";
import RewardsMarquee from "./components/RewardsMarquee";
import RewardsSelfFundedMarquee from "./components/RewardsSelfFundedMarquee";
import { useContestStore } from "@hooks/useContest/store";
import { useShallow } from "zustand/shallow";

interface ContestRewardsInfoProps {
  version: string;
}

const ContestRewardsInfo: FC<ContestRewardsInfoProps> = ({ version }) => {
  const pathname = usePathname();
  const { chainName } = extractPathSegments(pathname);
  const chainId = chains.filter(
    (chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainName.toLowerCase(),
  )?.[0]?.id;
  const { data: rewards, isLoading, isSuccess, isError } = useRewardsModule();
  const {
    isCanceled,
    isLoading: isCancelLoading,
    isError: isCancelError,
  } = useCancelRewards({
    rewardsAddress: rewards?.contractAddress as `0x${string}`,
    abi: rewards?.abi as Abi,
    chainId,
    version,
  });

  if (isLoading || isCancelLoading) {
    return <RewardsLoader />;
  }

  if (isError || !isSuccess || isCanceled || isCancelError || !rewards || rewards.isBytecodeInvalid) return null;

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <RewardsMarquee moduleType={rewards.moduleType} />
      <RewardsDisplay
        rewardsModuleAddress={rewards.contractAddress as `0x${string}`}
        rewardsAbi={rewards.abi as Abi}
        chainId={chainId}
        chainName={chainName}
        rewards={rewards}
        isRewardsModuleLoading={isLoading}
        isRewardsModuleError={isError}
      />
      {rewards.isSelfFunded && <RewardsSelfFundedMarquee />}
    </div>
  );
};

export default ContestRewardsInfo;
