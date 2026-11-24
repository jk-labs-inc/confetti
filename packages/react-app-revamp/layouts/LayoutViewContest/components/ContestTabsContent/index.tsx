import ContestTab from "@components/_pages/Contest/Contest";
import ContestDeployRewards from "@components/_pages/Contest/DeployRewards";
import ContestParameters from "@components/_pages/Contest/Parameters";
import ContestRewards from "@components/_pages/Contest/Rewards";
import { Tab } from "@components/_pages/Contest/components/Tabs";
import PreVoteContestTab from "@components/_pages/Contest/PreVote/PreVoteContestTab";
import PreVotePhoneTab from "@components/_pages/Contest/PreVote/PreVotePhoneTab";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { FC, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import ContestStatRow from "../ContestStatRow";
import ContestTabLayout from "../ContestTabLayout";

interface ContestTabsContentProps {
  tab: Tab;
  showVoteRail: boolean;
  showMarketRail: boolean;
  isPreVoteSplit: boolean;
  isPreVotePhone: boolean;
  needsRewardsDeploy: boolean;
}

const ContestTabsContent: FC<ContestTabsContentProps> = ({
  tab,
  showVoteRail,
  showMarketRail,
  isPreVoteSplit,
  isPreVotePhone,
  needsRewardsDeploy,
}) => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  const renderContent = (): ReactNode => {
    switch (tab) {
      case Tab.Contest:
        if (needsRewardsDeploy) {
          return <ContestDeployRewards />;
        }
        if (showMarketRail) {
          return <ContestTabLayout showVoteRail={showVoteRail} />;
        }
        if (isPreVoteSplit) {
          return <PreVoteContestTab />;
        }
        if (isPreVotePhone) {
          return <PreVotePhoneTab />;
        }
        return (
          <>
            {isMobile && <ContestStatRow />}
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
