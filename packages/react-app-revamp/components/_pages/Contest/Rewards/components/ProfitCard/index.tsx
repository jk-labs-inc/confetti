import useContestProfit from "@hooks/useContestProfit";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useWallet } from "@hooks/useWallet";
import Image from "next/image";
import { RewardModuleInfo } from "lib/rewards/types";
import { FC, memo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import ShareDropdown from "./components/ShareDropdown";
import Loader from "@components/UI/Loader";

interface ContestProfitCardProps {
  contestAddress: `0x${string}`;
  chainId: number;
  rewards: RewardModuleInfo;
}

const ContestProfitCard: FC<ContestProfitCardProps> = ({ contestAddress, chainId, rewards }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWallet();
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const chainName = useContestConfigStore(useShallow(state => state.contestConfig.chainName));
  const { isAnalyticsSupported, profitPercentage, isInProfit, isLoading, isError, refetch } = useContestProfit({
    contestAddress,
    chainId,
    rewards,
  });

  const hasContestEnded = contestStatus === ContestStatus.VotingClosed;

  if (!isConnected || !isAnalyticsSupported || !hasContestEnded || (!isLoading && !isInProfit)) return null;

  if (isLoading) {
    return (
      <div className="profit-card-wrapper max-w-96 md:max-w-none">
        <div className="profit-card-inner flex items-center justify-center h-[144px] md:h-[296px]">
          <Loader className="mt-0!" isAdditionalTextEnabled={false} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="profit-card-wrapper max-w-96 md:max-w-none">
        <div className="profit-card-inner flex items-center justify-between px-8 md:px-[88px] py-6 md:py-8">
          <p className="text-[14px] text-negative-11">failed to load profit data</p>
          <button
            onClick={refetch}
            className="text-xs text-neutral-11 underline hover:text-neutral-14 transition-colors"
            aria-label="Retry loading profit data"
            tabIndex={0}
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profit-card-wrapper max-w-96 md:max-w-none" ref={cardRef}>
      <div className="profit-card-inner flex justify-between p-6 md:px-[88px] md:py-8 md:h-[296px] overflow-hidden">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-0.5 md:gap-1">
            <div className="flex items-center gap-2 md:gap-4">
              <Image
                src="/confetti/confetti-logo.png"
                alt="confetti"
                width={224}
                height={42}
                className="w-[96px] h-[18px] md:w-[224px] md:h-[42px]"
              />
              <ShareDropdown
                cardRef={cardRef}
                profitPercentage={profitPercentage}
                contestAddress={contestAddress}
                chainName={chainName}
              />
            </div>
            <p className="text-xs md:text-base font-bold text-[#585858]">https://confetti.win</p>
          </div>

          <div className="flex flex-col gap-1 md:gap-2">
            <p className="profit-card-label">profit</p>
            <p className="profit-card-percentage">
              <span className="profit-card-percentage-sign">+</span>
              {profitPercentage.toFixed(0)}
              <span className="profit-card-percentage-symbol">%</span>
            </p>
          </div>
        </div>

        <img
          src="/landing/bubbles-money-group.png"
          alt="bubbles-money-group"
          className="w-[108px] h-[111px] md:w-[232px] md:h-[237px]"
        />
      </div>
    </div>
  );
};

export default ContestProfitCard;
