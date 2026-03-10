import Loader from "@components/UI/Loader";
import { ofacAddresses } from "@config/ofac-addresses/ofac-addresses";
import { getChainExplorer } from "@helpers/getChainExplorer";
import { useCancelRewards } from "@hooks/useCancelRewards";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useRewardsModule from "@hooks/useRewards";
import { ModuleType } from "lib/rewards/types";
import { Abi } from "viem";
import { useWallet } from "@hooks/useWallet";
import { useShallow } from "zustand/shallow";
import RewardsError from "./modules/shared/Error";
import RewardsCanceled from "./modules/shared/RewardsCanceled";
import VotersRewardsPage from "./modules/Voters";
import { useConnectionEffect } from "wagmi";

const ContestRewards = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const chainExplorer = getChainExplorer(contestConfig.chainId);
  const { contestAuthorEthereumAddress } = useContestStore(state => state);
  const { data: rewards, isLoading, isError, refetch, isRefetching } = useRewardsModule();
  const { userAddress } = useWallet();
  const creator = contestAuthorEthereumAddress === userAddress;
  const {
    isCanceled,
    isError: isRewardsCanceledError,
    refetch: refetchRewardsCanceled,
  } = useCancelRewards({
    rewardsAddress: rewards?.contractAddress as `0x${string}`,
    abi: rewards?.abi as Abi,
    chainId: contestConfig.chainId,
    version: contestConfig.version,
  });

  useConnectionEffect({
    onConnect(data) {
      if (ofacAddresses.includes(data.address)) {
        window.location.href = "https://www.google.com/search?q=what+are+ofac+sanctions";
      }
    },
  });

  if (isLoading || isRefetching) return <Loader>Loading rewards</Loader>;

  if (isRewardsCanceledError || isError || !rewards) {
    return <RewardsError onRetry={isRewardsCanceledError ? refetchRewardsCanceled : refetch} />;
  }

  if (rewards.isBytecodeInvalid) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[24px] text-negative-11 font-bold">ruh roh!</p>
        <p className="text-[16px] text-neutral-11">
          the rewards module contract could not be verified — its bytecode doesn&apos;t match any known version.
        </p>
      </div>
    );
  }

  if (isCanceled) {
    return (
      <RewardsCanceled
        isCreatorView={creator}
        rewardsModuleAddress={rewards.contractAddress as `0x${string}`}
        rewardsAbi={rewards.abi as Abi}
        rankings={rewards.payees}
        chainId={contestConfig.chainId}
        version={contestConfig.version}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      {rewards.moduleType === ModuleType.VOTER_REWARDS ? (
        <VotersRewardsPage
          rewards={rewards}
          contestAddress={contestConfig.address as `0x${string}`}
          chainId={contestConfig.chainId}
          version={contestConfig.version}
        />
      ) : rewards.moduleType === ModuleType.AUTHOR_REWARDS ? (
        <div className="flex flex-col gap-2">
          <p className="text-[18px] text-neutral-11">winners rewards are not supported anymore</p>
          <p className="text-[16px] text-neutral-11">
            if you would still like to look at contract, you can see it{" "}
            <a
              href={`${chainExplorer}address/${rewards.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-positive-11 font-bold"
            >
              here
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ContestRewards;
