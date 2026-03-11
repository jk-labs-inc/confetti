import PriceCurveWrapper from "@components/_pages/Contest/components/PriceCurveChart/wrapper";
import usePriceCurveChartStore from "@components/_pages/Contest/components/PriceCurveChart/store";
import ContestImage from "@components/_pages/Contest/components/ContestImage";
import EditContestImage from "@components/_pages/Contest/components/ContestImage/components/EditContestImage";
import ContestName from "@components/_pages/Contest/components/ContestName";
import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import { FC } from "react";
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

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col mt-10 gap-6">
        {contestImageUrl && (
          <div className="relative">
            <div className="absolute left-0 -translate-x-full -ml-4 bottom-0">
              <EditContestImage contestPrompt={contestPrompt} canEditTitle={canEditTitle} />
            </div>
            <ContestImage imageUrl={contestImageUrl} />
          </div>
        )}

        {/* Row 1: name, author, share */}
        <ContestName
          contestName={contestName}
          contestAddress={contestAddress}
          chainName={chainName}
          canEditTitle={canEditTitle}
          contestAuthorEthereumAddress={contestAuthorEthereumAddress}
        />

        {/* Row 2: rewards, timing, price curve */}
        <div className="flex justify-between">
          <ContestRewardsInfo version={contestVersion} />
          <ContestTiming />
          <ContestPriceCurve />
        </div>

        {isExpanded && <PriceCurveWrapper />}
      </div>
    </div>
  );
};

export default DesktopHeader;
