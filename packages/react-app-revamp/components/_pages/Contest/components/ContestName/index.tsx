import GradientText from "@components/UI/GradientText";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import CancelContest from "../CancelContest";
import EditContestName from "./components/EditContestName";
import ShareDropdown from "@components/Share";

interface ContestNameProps {
  contestAddress: string;
  chainName: string;
  contestName: string;
  contestPrompt: string;
  canEditTitle: boolean;
}

const ContestName: FC<ContestNameProps> = ({ contestName, contestAddress, chainName, contestPrompt, canEditTitle }) => {
  const { contestState } = useContestStateStore(state => state);
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full">
        <GradientText isStrikethrough={isContestCanceled}>{contestName}</GradientText>
        <div className="flex items-center gap-2">
          <EditContestName contestName={contestName} contestPrompt={contestPrompt} canEditTitle={canEditTitle} />
          <CancelContest />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center relative w-full">
      <div className="absolute left-0 -translate-x-full -ml-4 flex items-center gap-2">
        <EditContestName contestName={contestName} contestPrompt={contestPrompt} canEditTitle={canEditTitle} />
        <CancelContest />
      </div>
      <div className="flex items-center justify-between w-full">
        <GradientText isStrikethrough={isContestCanceled}>{contestName}</GradientText>
        <ShareDropdown contestAddress={contestAddress} chain={chainName} contestName={contestName} />
      </div>
    </div>
  );
};

export default ContestName;
