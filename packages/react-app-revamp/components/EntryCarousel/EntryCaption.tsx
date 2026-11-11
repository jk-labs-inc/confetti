import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { FC } from "react";
import EntryNavButton from "./EntryNavButton";

interface EntryCaptionProps {
  title: string;
  votes: number | null;
  onPrevious?: () => void;
  onNext?: () => void;
}

const EntryCaption: FC<EntryCaptionProps> = ({ title, votes, onPrevious, onNext }) => {
  if (!title && votes === null && !onPrevious && !onNext) return null;

  return (
    <div className="flex min-h-14 shrink-0 items-center gap-2 border-t border-white/8 px-2 py-2">
      {onPrevious ? <EntryNavButton direction="previous" onClick={onPrevious} /> : null}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
        {title ? (
          <p className="line-clamp-2 text-[15px] font-bold leading-tight text-neutral-11 wrap-anywhere">{title}</p>
        ) : null}
        {votes !== null ? (
          <p className="flex items-baseline gap-1.5 leading-none text-neutral-11">
            <span className="text-[17px] font-bold tabular-nums">
              <VoteCountPulse votes={votes}>{formatNumberWithCommas(votes)}</VoteCountPulse>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-9">votes</span>
          </p>
        ) : null}
      </div>
      {onNext ? <EntryNavButton direction="next" onClick={onNext} /> : null}
    </div>
  );
};

export default EntryCaption;
