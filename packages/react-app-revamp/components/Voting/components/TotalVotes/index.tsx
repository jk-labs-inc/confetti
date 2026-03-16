import { useVotingStore } from "@components/Voting/store";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

interface TotalVotesProps {
  costToVote: string;
  spendableBalance: string;
  isBelowMinimum?: boolean;
}

const TotalVotes: FC<TotalVotesProps> = ({ costToVote, spendableBalance, isBelowMinimum = false }) => {
  const inputValue = useVotingStore(useShallow(state => state.inputValue));
  const totalVotes = useVotesFromInput({
    costToVote: costToVote,
    inputValue: inputValue,
  });

  const votesColor = isBelowMinimum ? "text-negative-11" : "text-neutral-9";

  return (
    <div className="flex items-center justify-between text-neutral-9 text-[16px]">
      <p>total votes</p>
      <p className={`${votesColor} transition-colors duration-300`}>{formatNumberWithCommas(totalVotes)}</p>
    </div>
  );
};

export default TotalVotes;
