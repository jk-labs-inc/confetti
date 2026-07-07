import { FC } from "react";
import EntryRankMedal from "../components/EntryRankMedal";
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
  const rank = rankById.get(vote.proposalId);

  return (
    <div className="flex items-center gap-2 text-neutral-11/70">
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <EntryRankMedal rank={rank} />
        {title && <span className="truncate font-semibold text-neutral-11">{title}</span>}
      </span>

      <CastAmount cost={vote.totalCost} votes={vote.voteAmount} formatPrice={formatPrice} />
    </div>
  );
};

export default CastRow;
