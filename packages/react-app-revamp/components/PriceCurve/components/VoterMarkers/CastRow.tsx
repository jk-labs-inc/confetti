import { FC } from "react";
import { NEUTRAL_ENTRY_COLOR } from "./entryColors";
import { PositionedVote } from "./types";

interface CastRowProps {
  vote: PositionedVote;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  entryColorsById: Map<string, string>;
}

const CastRow: FC<CastRowProps> = ({ vote, formatPrice, entryTitlesById, entryColorsById }) => {
  const title = entryTitlesById.get(vote.proposalId);
  const color = entryColorsById.get(vote.proposalId) ?? NEUTRAL_ENTRY_COLOR;

  return (
    <div className="flex items-center gap-2 text-neutral-11/70">
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: color }} />
        {title && <span className="truncate">{title}</span>}
      </span>

      <span className="flex-none whitespace-nowrap text-right tabular-nums">
        <span className="text-neutral-11">{formatPrice(vote.totalCost)}</span>
        <span className="text-neutral-11/50">
          {" · "}
          {vote.voteAmount} {vote.voteAmount === 1 ? "vote" : "votes"}
        </span>
      </span>
    </div>
  );
};

export default CastRow;
