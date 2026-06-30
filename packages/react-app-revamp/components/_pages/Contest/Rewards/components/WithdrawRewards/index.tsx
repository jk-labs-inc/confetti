import Tooltip from "@components/UI/Tooltip";
import { TokenInfo, useReleasableRewards } from "@hooks/useReleasableRewards";
import { FC, useMemo, useState } from "react";
import { Abi } from "viem";
import WithdrawRewardsModal from "./components/Modal";

interface ContestWithdrawRewardsProps {
  rewardsModuleAddress: string;
  rewardsAbi: Abi;
  chainId: number;
  rankings: number[];
  isCanceledByJkLabs: boolean;
}

const ContestWithdrawRewards: FC<ContestWithdrawRewardsProps> = ({
  rewardsModuleAddress,
  rewardsAbi,
  chainId,
  rankings,
  isCanceledByJkLabs,
}) => {
  const [isWithdrawRewardsModalOpen, setIsWithdrawRewardsModalOpen] = useState(false);
  const { data: releasableRewards, isLoading: isReleasableRewardsLoading } = useReleasableRewards({
    contractAddress: rewardsModuleAddress,
    chainId: chainId,
    abi: rewardsAbi,
    rankings: rankings,
  });

  const aggregatedRewards = useMemo(() => {
    const rewardMap = new Map<string, TokenInfo>();

    releasableRewards?.forEach(reward => {
      reward.tokens.forEach(token => {
        const existingToken = rewardMap.get(token.address);
        if (existingToken) {
          existingToken.amount = (existingToken.amount || 0n) + (token.amount || 0n);
        } else {
          rewardMap.set(token.address, { ...token });
        }
      });
    });

    return Array.from(rewardMap.values()).filter(token => token.amount && token.amount > 0n);
  }, [releasableRewards]);

  return (
    <>
      {aggregatedRewards.length > 0 ? (
        <Tooltip
          place="top"
          surface="dark"
          className="max-w-64"
          disabled={!isCanceledByJkLabs}
          content={
            <div className="text-[12px] text-white">
              this rewards module has been canceled by jk labs at least a week after the underlying contest has ended and
              only they can withdraw the remaining funds in it to resolve any issues.
            </div>
          }
        >
          <span className="inline-block">
            <button
              className={`text-[16px] font-bold ${
                isCanceledByJkLabs ? "text-positive-11 cursor-not-allowed opacity-50" : "text-positive-11 cursor-pointer"
              }`}
              onClick={isCanceledByJkLabs ? undefined : () => setIsWithdrawRewardsModalOpen(true)}
              disabled={isCanceledByJkLabs}
            >
              📤 withdraw funds
            </button>
          </span>
        </Tooltip>
      ) : (
        <p className="text-neutral-11 text-[16px] font-bold">you have withdrawn funds</p>
      )}
      <WithdrawRewardsModal
        aggregatedRewards={aggregatedRewards}
        rewardsModuleAddress={rewardsModuleAddress}
        rewardsAbi={rewardsAbi}
        rankings={rankings}
        isReleasableRewardsLoading={isReleasableRewardsLoading}
        isWithdrawRewardsModalOpen={isWithdrawRewardsModalOpen}
        setIsWithdrawRewardsModalOpen={setIsWithdrawRewardsModalOpen}
      />
    </>
  );
};

export default ContestWithdrawRewards;
