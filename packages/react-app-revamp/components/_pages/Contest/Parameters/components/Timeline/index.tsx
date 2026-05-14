import ContestTimeline from "@components/_pages/Contest/components/Timeline";
import { FC, ReactNode } from "react";

interface ContestParametersTimelineProps {
  submissionsOpen: ReactNode;
  votesOpen: ReactNode;
  votesClose: ReactNode;
}

const ContestParametersTimeline: FC<ContestParametersTimelineProps> = ({ submissionsOpen, votesOpen, votesClose }) => {
  return (
    <div className="flex flex-col gap-8">
      <ContestTimeline />
      <div className="flex flex-col lg:hidden gap-4">
        <div className="flex justify-between items-end text-[16px] font-bold border-b border-neutral-10 pb-3">
          <p>open to enter:</p>
          <p>{submissionsOpen}</p>
        </div>
        <div className="flex justify-between items-end text-[16px] font-bold  border-b border-neutral-10 pb-3">
          <p>open to vote:</p>
          <p>{votesOpen}</p>
        </div>
        <div className="flex justify-between items-end text-[16px] font-bold  border-b border-neutral-10 pb-3">
          <p>contest closes:</p>
          <p>{votesClose}</p>
        </div>
      </div>
    </div>
  );
};

export default ContestParametersTimeline;
