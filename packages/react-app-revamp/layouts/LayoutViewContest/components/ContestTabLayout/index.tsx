import { ContestLayoutBand, useContestLayoutBand } from "@hooks/useContestLayoutBand";
import { FC } from "react";
import ContestMobileLayout from "../ContestMobileLayout";
import ContestTabletLayout from "../ContestTabletLayout";
import ContestTerminalLayout from "../ContestTerminalLayout";
import ContestTwoColumnLayout from "../ContestTwoColumnLayout";

interface ContestTabLayoutProps {
  showVoteRail: boolean;
}

const ContestTabLayout: FC<ContestTabLayoutProps> = ({ showVoteRail }) => {
  const band = useContestLayoutBand();

  switch (band) {
    case ContestLayoutBand.Mobile:
      return <ContestMobileLayout />;
    case ContestLayoutBand.Tablet:
      return <ContestTabletLayout />;
    case ContestLayoutBand.TwoColumn:
      return <ContestTwoColumnLayout showVoteRail={showVoteRail} />;
    case ContestLayoutBand.Terminal:
      return <ContestTerminalLayout showVoteRail={showVoteRail} />;
  }
};

export default ContestTabLayout;
