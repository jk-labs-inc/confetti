import DualPriceDisplay from "@components/UI/DualPriceDisplay";
import { formatVoteCount } from "@helpers/formatNumber";
import useVoteCurrencyDisplayPrice from "@hooks/useCurrency/useVoteCurrencyDisplayPrice";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { VoteCurrency } from "lib/voteCurrency";
import { FC } from "react";

interface AmountSummaryProps {
  spendAmount: string;
  voteCurrency: VoteCurrency;
  costToVote: string;
}

const AmountSummary: FC<AmountSummaryProps> = ({ spendAmount, voteCurrency, costToVote }) => {
  const { displayValue, displaySymbol, secondaryValue, secondarySymbol, isLoading } = useVoteCurrencyDisplayPrice(
    spendAmount,
    voteCurrency,
  );
  const totalVotes = useVotesFromInput({ inputValue: spendAmount, costToVote });

  return (
    <div className="flex flex-col items-start gap-1 py-2">
      <p className="text-[24px] font-bold text-neutral-11">{formatVoteCount(totalVotes)}</p>
      <p className="text-[16px] text-neutral-9">
        for{" "}
        <DualPriceDisplay
          displayValue={displayValue}
          displaySymbol={displaySymbol}
          secondaryValue={secondaryValue}
          secondarySymbol={secondarySymbol}
          primaryClassName="font-bold"
          isLoading={isLoading}
        />
      </p>
    </div>
  );
};

export default AmountSummary;
