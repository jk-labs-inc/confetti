import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import ContestTiming from "../ContestHeader/components/DesktopHeader/components/ContestTiming";
import ContestTab from "@components/_pages/Contest/Contest";
import ContestDeployRewards from "@components/_pages/Contest/DeployRewards";
import ContestExtensions from "@components/_pages/Contest/Extensions";
import ContestParameters from "@components/_pages/Contest/Parameters";
import ContestRewards from "@components/_pages/Contest/Rewards";
import { Tab } from "@components/_pages/Contest/components/Tabs";
import { compareVersions } from "compare-versions";
import { SELF_FUND_VERSION } from "constants/versions";
import { RewardModuleInfo } from "lib/rewards/types";
import { FC, ReactNode } from "react";

interface ContestTabsContentProps {
  tab: Tab;
  version: string;
  rewardsModule?: RewardModuleInfo | null;
}

const ContestTabsContent: FC<ContestTabsContentProps> = ({ tab, version, rewardsModule }) => {
  const renderContent = (): ReactNode => {
    switch (tab) {
      case Tab.Contest:
        if (rewardsModule || compareVersions(version, SELF_FUND_VERSION) < 0) {
          return (
            <>
              <div className="flex items-center justify-between mt-4 md:mt-6">
                <ContestRewardsInfo version={version} />
                <ContestTiming />
              </div>
              <ContestTab />
            </>
          );
        } else {
          return <ContestDeployRewards />;
        }
      case Tab.Rewards:
        return (
          <div className="mt-6 md:mt-12">
            <ContestRewards />
          </div>
        );
      case Tab.Rules:
        return (
          <div className="mt-6 md:mt-12">
            <ContestParameters />
          </div>
        );
      case Tab.Extensions:
        return (
          <div className="mt-6 md:mt-12">
            <ContestExtensions />
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default ContestTabsContent;
