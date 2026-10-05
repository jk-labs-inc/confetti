import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC } from "react";
import ConfettiPiece from "./ConfettiPiece";
import { FLOOR_CONFETTI, HEAD_CONFETTI } from "./confetti";
import Spotlight from "./Spotlight";

const SAD_MASCOT_SRC = "/entry/no-votes-bubbles.png";
const MASCOT_PX = 112;
const TITLE = "nobody showed up";

const VOTING_OPEN_HINT = "submissions closed without a single entry, so there's nothing to back in this contest";
const VOTING_CLOSED_HINT = "this contest wrapped without a single entry";

const EmptyEntries: FC = () => {
  const isVotingClosed = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingClosed;

  return (
    <div className="animate-fade-in relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden px-6 py-12 text-center md:min-h-[480px]">
      <div className="relative" style={{ width: MASCOT_PX, height: MASCOT_PX }}>
        <Spotlight />
        {FLOOR_CONFETTI.map((piece, index) => (
          <ConfettiPiece key={index} piece={piece} />
        ))}
        <div className="empty-stage-sway relative h-full w-full">
          <img
            src={SAD_MASCOT_SRC}
            width={MASCOT_PX}
            height={MASCOT_PX}
            alt=""
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
          <ConfettiPiece piece={HEAD_CONFETTI} />
        </div>
      </div>
      <h3 className="relative mt-8 font-sabo-filled text-[24px] leading-none text-neutral-11 md:text-[28px]">
        {TITLE}
      </h3>
      <p className="relative mt-3 max-w-[340px] text-[14px] text-neutral-9 md:text-[16px]">
        {isVotingClosed ? VOTING_CLOSED_HINT : VOTING_OPEN_HINT}
      </p>
      <CustomLink
        href={ROUTE_VIEW_LIVE_CONTESTS}
        className="relative mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-neutral-10 bg-true-black px-5 text-[16px] font-bold text-neutral-11 transition-colors hover:border-neutral-11 hover:bg-neutral-2"
      >
        find a live contest
        <ArrowRightIcon className="h-4 w-4" />
      </CustomLink>
    </div>
  );
};

export default EmptyEntries;
