import { FC } from "react";

interface BoardCaptionProps {
  poolLabel: string | null;
  isVotingOpen: boolean;
}

const BoardCaption: FC<BoardCaptionProps> = ({ poolLabel, isVotingOpen }) => (
  <p className="text-[12px] text-neutral-9">
    {poolLabel ? (
      <>
        estimated payouts from the <b className="text-neutral-11">{poolLabel}</b> pool right now
      </>
    ) : (
      "who's backing what right now"
    )}
    {isVotingOpen ? " · updates live" : ""}
  </p>
);

export default BoardCaption;
