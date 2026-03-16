import PriceCurveWrapper from "@components/_pages/Contest/components/PriceCurveChart/wrapper";
import usePriceCurveChartStore from "@components/_pages/Contest/components/PriceCurveChart/store";
import ContestImage from "@components/_pages/Contest/components/ContestImage";
import EditContestImage from "@components/_pages/Contest/components/ContestImage/components/EditContestImage";
import ContestName from "@components/_pages/Contest/components/ContestName";
import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { FC, useMemo } from "react";
import { Abi } from "viem";
import ContestPriceCurve from "./components/ContestPriceCurve";
import ContestTiming from "./components/ContestTiming";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestAddress: string;
  chainName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
}

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestAddress,
  chainName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestVersion,
}) => {
  const { isExpanded } = usePriceCurveChartStore();
  const { contestConfig } = useContestConfigStore(state => state);
  const { data: rewards } = useRewardsModule();
  const { data: totalRewards } = useTotalRewards({
    rewardsModuleAddress: rewards?.contractAddress as `0x${string}`,
    rewardsModuleAbi: rewards?.abi as Abi,
    chainId: contestConfig.chainId,
    enabled: !!rewards && !rewards.isBytecodeInvalid,
  });

  const hasRewards = useMemo(() => {
    if (!totalRewards) return false;
    if (totalRewards.native && totalRewards.native.value > 0n) return true;
    if (totalRewards.tokens) {
      return Object.values(totalRewards.tokens).some(t => t.value > 0n);
    }
    return false;
  }, [totalRewards]);

  return (
    <div className="animate-fade-in relative z-10">
      <div className="flex flex-col mt-10 gap-6">
        {contestImageUrl && (
          <div className="relative">
            <div className="absolute left-0 -translate-x-full -ml-4 bottom-0">
              <EditContestImage contestPrompt={contestPrompt} canEditTitle={canEditTitle} />
            </div>
            <ContestImage imageUrl={contestImageUrl} />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <ContestName
            contestName={contestName}
            contestAddress={contestAddress}
            chainName={chainName}
            canEditTitle={canEditTitle}
            contestAuthorEthereumAddress={contestAuthorEthereumAddress}
            contestPrompt={contestPrompt}
            contestImageUrl={contestImageUrl}
          />

          <div className={`flex ${hasRewards ? "justify-between" : "gap-8"}`}>
            <ContestRewardsInfo version={contestVersion} />
            <ContestTiming />
            <ContestPriceCurve />
          </div>

          {isExpanded && <PriceCurveWrapper />}
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;
