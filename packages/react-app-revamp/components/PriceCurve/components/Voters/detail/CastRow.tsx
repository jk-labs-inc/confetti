import { entryMedal } from "@helpers/entryColors";
import { FC } from "react";
import { PositionedVote } from "../types";
import CastAmount from "./CastAmount";

interface CastRowProps {
  vote: PositionedVote;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  rankById: Map<string, number>;
}

const CastRow: FC<CastRowProps> = ({ vote, formatPrice, entryTitlesById, rankById }) => {
  const title = entryTitlesById.get(vote.proposalId);
  const medal = entryMedal(rankById.get(vote.proposalId));

  return (
    <div className="flex items-center gap-2 text-neutral-11/70">
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: medal.solid }} />
        {title && <span className="truncate">{title}</span>}
      </span>

      <CastAmount cost={vote.totalCost} votes={vote.voteAmount} formatPrice={formatPrice} />
    </div>
  );
};

export default CastRow;
