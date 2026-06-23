import { FC } from "react";

interface CastAmountProps {
  cost: number;
  votes: number;
  formatPrice: (nativePrice: number) => string;
  formatVotes?: (votes: number) => string;
}

const CastAmount: FC<CastAmountProps> = ({ cost, votes, formatPrice, formatVotes }) => (
  <span className="flex-none whitespace-nowrap text-right tabular-nums">
    <span className="text-neutral-11">{formatPrice(cost)}</span>
    <span className="text-neutral-11/50">
      {" · "}
      {formatVotes ? formatVotes(votes) : votes} {votes === 1 ? "vote" : "votes"}
    </span>
  </span>
);

export default CastAmount;
