import { useFitRowText } from "@hooks/useFitRowText";
import { ProcessedContest } from "lib/contests/types";
import { FC, ReactNode, useRef } from "react";
import ContestTiming from "../ContestTiming";

interface CardFooterProps {
  contest: ProcessedContest;
  action?: ReactNode;
}

const FOOTER_FONT_SIZE = { min: 9, max: 16 };

const CardFooter: FC<CardFooterProps> = ({ contest, action }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const fontSize = useFitRowText(rowRef, FOOTER_FONT_SIZE);

  return (
    <div className="flex items-center justify-between gap-3">
      <div
        ref={rowRef}
        style={{ fontSize: `${fontSize}px` }}
        className="flex items-center gap-6 h-6 min-w-0 overflow-hidden"
      >
        <ContestTiming contest={contest} />
      </div>
      {action}
    </div>
  );
};

export default CardFooter;
