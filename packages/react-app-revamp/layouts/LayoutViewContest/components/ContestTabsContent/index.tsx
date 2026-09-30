import ContestTab from "@components/_pages/Contest/Contest";
import ContestDeployRewards from "@components/_pages/Contest/DeployRewards";
import ContestParameters from "@components/_pages/Contest/Parameters";
import ContestRewards from "@components/_pages/Contest/Rewards";
import { Tab } from "@components/_pages/Contest/components/Tabs";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { compareVersions } from "compare-versions";
import { SELF_FUND_VERSION } from "constants/versions";
import { RewardModuleInfo } from "lib/rewards/types";
import { FC, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import ContestStatRow from "../ContestStatRow";
import ContestTabLayout from "../ContestTabLayout";

interface ContestTabsContentProps {
  tab: Tab;
  version: string;
  rewardsModule?: RewardModuleInfo | null;
  showVoteRail: boolean;
  showMarketRail: boolean;
}

const ContestTabsContent: FC<ContestTabsContentProps> = ({
  tab,
  version,
  rewardsModule,
  showVoteRail,
  showMarketRail,
}) => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  const renderContent = (): ReactNode => {
    switch (tab) {
      case Tab.Contest:
        if (!rewardsModule && compareVersions(version, SELF_FUND_VERSION) >= 0) {
          return <ContestDeployRewards />;
        }
        if (showMarketRail) {
          return <ContestTabLayout showVoteRail={showVoteRail} />;
        }
        return (
          <>
            {isMobile && <ContestStatRow version={version} />}
            <ContestTab />
          </>
        );
      case Tab.Rewards:
        return (
          <div className="mt-6 md:mt-12 lg:max-w-[760px]">
            <ContestRewards />
          </div>
        );
      case Tab.Rules:
        return (
          <div className="mt-6 md:mt-12 lg:max-w-[760px]">
            <ContestParameters />
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default ContestTabsContent;
