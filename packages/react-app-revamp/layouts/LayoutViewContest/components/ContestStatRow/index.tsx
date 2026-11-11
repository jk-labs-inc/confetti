import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import { FC } from "react";
import ContestTiming from "../ContestHeader/components/DesktopHeader/components/ContestTiming";

const ContestStatRow: FC = () => (
  <div className="flex items-center justify-between mt-4 md:mt-6">
    <ContestRewardsInfo />
    <ContestTiming />
  </div>
);

export default ContestStatRow;
