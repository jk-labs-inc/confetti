import { useFitRowText } from "@hooks/useFitRowText";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { FC, useRef } from "react";
import ContestRewards from "../ContestRewards";
import ContestTiming from "../ContestTiming";

interface CardFooterProps {
  contest: ProcessedContest;
  rewardsData?: ContestWithTotalRewards | null;
  isRewardsFetching: boolean;
}

const FOOTER_FONT_SIZE = { min: 9, max: 12 };

const CardFooter: FC<CardFooterProps> = ({ contest, rewardsData, isRewardsFetching }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const fontSize = useFitRowText(rowRef, FOOTER_FONT_SIZE);

  return (
    <div
      ref={rowRef}
      style={{ fontSize: `${fontSize}px` }}
      className="flex items-center gap-6 h-8 min-w-0 overflow-hidden"
    >
      <ContestTiming contest={contest} />
      <ContestRewards contestData={contest} rewardsData={rewardsData} isRewardsFetching={isRewardsFetching} />
    </div>
  );
};

export default CardFooter;
