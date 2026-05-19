import { getTimeZoneAbbreviation } from "@helpers/dates";
import moment from "moment-timezone";
import { FC } from "react";
import CreateContestConfirmLayout from "../Layout";

interface CreateContestConfirmTimingProps {
  timing: {
    votingOpen: Date;
    votingClose: Date;
  };
  step: number;
  onClick?: (stepIndex: number) => void;
}

const CreateContestConfirmTiming: FC<CreateContestConfirmTimingProps> = ({ timing, step, onClick }) => {
  const { votingOpen, votingClose } = timing;

  const renderTime = (date: Date) => (
    <>
      {moment(date).format("h:mma")} <span className="uppercase">{getTimeZoneAbbreviation(date)}</span> on{" "}
      {moment(date).format("MMMM D")}
    </>
  );

  return (
    <CreateContestConfirmLayout onClick={() => onClick?.(step)}>
      <div className="flex flex-col gap-2">
        <p className="text-neutral-9 text-[12px] font-bold uppercase">timing</p>
        <ul className="flex flex-col pl-6 list-disc">
          <li className="text-[16px] text-neutral-11">
            Voting runs from {renderTime(votingOpen)} to {renderTime(votingClose)}.
          </li>
        </ul>
      </div>
    </CreateContestConfirmLayout>
  );
};

export default CreateContestConfirmTiming;
