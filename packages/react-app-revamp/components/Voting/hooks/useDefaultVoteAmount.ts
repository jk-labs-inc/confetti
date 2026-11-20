import { useVotingStore } from "@components/Voting/store";
import { defaultVoteAmount } from "@components/Voting/utils/defaultVoteAmount";
import useVoteCurrencyUsdRate from "@hooks/useCurrency/useVoteCurrencyUsdRate";
import { VoteCurrency } from "lib/voteCurrency";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

export const useDefaultVoteAmount = ({
  contest,
  voteCurrency,
  pricePerVoteNative,
}: {
  contest: string;
  voteCurrency: VoteCurrency;
  pricePerVoteNative: string;
}) => {
  const { rate: voteCurrencyUsdRate, isResolved: isRateResolved } = useVoteCurrencyUsdRate(voteCurrency);
  const { isAmountEdited, prefilledFor, prefillAmount } = useVotingStore(
    useShallow(state => ({
      isAmountEdited: state.isAmountEdited,
      prefilledFor: state.prefilledFor,
      prefillAmount: state.prefillAmount,
    })),
  );
  const amount = isRateResolved ? defaultVoteAmount({ voteCurrencyUsdRate, pricePerVoteNative }) : null;

  useEffect(() => {
    if (prefilledFor !== null && prefilledFor !== contest) {
      prefillAmount("", null);
      return;
    }
    if (amount === null || prefilledFor === contest || isAmountEdited) return;
    prefillAmount(amount, contest);
  }, [isAmountEdited, prefilledFor, contest, amount, prefillAmount]);
};
