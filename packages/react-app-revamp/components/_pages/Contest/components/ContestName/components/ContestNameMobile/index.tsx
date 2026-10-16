import CancelContest from "@components/_pages/Contest/components/CancelContest";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { FC } from "react";
import type { ContestNameProps } from "../../types";
import EditContestName from "../EditContestName";

const ContestNameMobile: FC<ContestNameProps> = ({ contestName, canEditTitle, contestPrompt, contestImageUrl }) => {
  const isContestCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;

  return (
    <div className="flex items-center justify-between w-full">
      <p className={`text-[20px] md:text-[32px] text-neutral-11 font-bold ${isContestCanceled ? "line-through" : ""}`}>
        {contestName}
      </p>
      <div className="flex items-center gap-2">
        <EditContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
        />
        <CancelContest />
      </div>
    </div>
  );
};

export default ContestNameMobile;
