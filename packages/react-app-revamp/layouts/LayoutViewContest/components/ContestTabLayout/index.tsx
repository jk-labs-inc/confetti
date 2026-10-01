import { ContestLayoutBand, useContestLayoutBand } from "@hooks/useContestLayoutBand";
import { FC } from "react";
import { useHasNoEntries } from "../../hooks/useEntriesReady";
import ContestEntriesColumn from "../ContestEntriesColumn";
import ContestMobileLayout from "../ContestMobileLayout";
import ContestTabletLayout from "../ContestTabletLayout";
import ContestTerminalLayout from "../ContestTerminalLayout";
import ContestTwoColumnLayout from "../ContestTwoColumnLayout";

interface ContestTabLayoutProps {
  showVoteRail: boolean;
}

const ContestTabLayout: FC<ContestTabLayoutProps> = ({ showVoteRail }) => {
  const band = useContestLayoutBand();
  const hasNoEntries = useHasNoEntries();

  if (hasNoEntries) {
    return (
      <div className="mt-3">
        <ContestEntriesColumn scrollMode="page" />
      </div>
    );
  }

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
