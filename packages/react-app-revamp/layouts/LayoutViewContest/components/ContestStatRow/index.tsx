import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import { FC } from "react";
import ContestTiming from "../ContestHeader/components/DesktopHeader/components/ContestTiming";

interface ContestStatRowProps {
  version: string;
}

const ContestStatRow: FC<ContestStatRowProps> = ({ version }) => (
  <div className="flex items-center justify-between mt-4 md:mt-6">
    <ContestRewardsInfo version={version} />
    <ContestTiming />
  </div>
);

export default ContestStatRow;
