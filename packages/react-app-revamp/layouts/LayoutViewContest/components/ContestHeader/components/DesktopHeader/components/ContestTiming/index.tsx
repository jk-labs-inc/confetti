import { getCountdownSegments } from "@helpers/dates";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { FC, ReactNode, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

const formatScheduleWindow = (voteStart: moment.Moment, end: moment.Moment): string => {
  const startDate = voteStart.format("MMM D").toLowerCase();
  const endDate = end.format("MMM D").toLowerCase();
  const startTime = `${voteStart.format("h")}${voteStart.format("a")}`;
  const endTime = `${end.format("h")}${end.format("a")}`;

  if (voteStart.isSame(end, "day")) {
    const samePeriod = voteStart.format("a") === end.format("a");
    const range = samePeriod ? `${voteStart.format("h")}-${endTime}` : `${startTime}-${endTime}`;

    return `${startDate}, ${range}`;
  }

  return `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
};

const ContestTiming: FC = () => {
  const { votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const isCanceled = useContestStateStore(useShallow(state => state.contestState === ContestStateEnum.Canceled));
  const votingTimeLeft = useCountdownTimer(votesClose);
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  const display = useMemo<{ content: ReactNode; dimmed: boolean }>(() => {
    if (isCanceled) return { content: "canceled", dimmed: true };

    const now = moment();
    const voteStart = moment(votesOpen);
    const end = moment(votesClose);

    if (now.isSameOrAfter(end)) return { content: "ended", dimmed: true };

    if (now.isSameOrAfter(voteStart) && now.isBefore(end)) {
      const segments = getCountdownSegments(votingTimeLeft, isMobile);
      const content = segments.map((seg, i) => (
        <span key={i}>
          <span className="text-[20px] md:text-[24px] font-bold">{seg.value}</span>{" "}
          <span className="text-base font-bold">{seg.unit}</span>
          {i < segments.length - 1 ? " " : ""}
        </span>
      ));
      return { content, dimmed: false };
    }

    return {
      content: formatScheduleWindow(voteStart, end),
      dimmed: false,
    };
  }, [isCanceled, votesOpen, votesClose, votingTimeLeft, isMobile]);

  return (
    <div
      className={`flex items-baseline gap-1 whitespace-nowrap ${display.dimmed ? "text-neutral-9" : "text-neutral-11"}`}
    >
      <span className="text-2xl">⏱️</span>
      <p className="text-[16px] md:text-[24px] font-bold md:font-normal">{display.content}</p>
    </div>
  );
};

export default ContestTiming;
