import { useVotingStore } from "@components/Voting/store";
import { defaultVoteAmount } from "@components/Voting/utils/defaultVoteAmount";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

export const useDefaultVoteAmount = ({
  contest,
  nativeSymbol,
  pricePerVoteNative,
}: {
  contest: string;
  nativeSymbol: string;
  pricePerVoteNative: string;
}) => {
  const { data: nativeRates } = useNativeRates();
  const { isAmountEdited, prefilledFor, prefillAmount } = useVotingStore(
    useShallow(state => ({
      isAmountEdited: state.isAmountEdited,
      prefilledFor: state.prefilledFor,
      prefillAmount: state.prefillAmount,
    })),
  );
  const amount = nativeRates
    ? defaultVoteAmount({ nativeUsdRate: nativeRates[nativeSymbol.toLowerCase()], pricePerVoteNative })
    : null;

  useEffect(() => {
    if (prefilledFor !== null && prefilledFor !== contest) {
      prefillAmount("", null);
      return;
    }
    if (amount === null || prefilledFor === contest || isAmountEdited) return;
    prefillAmount(amount, contest);
  }, [isAmountEdited, prefilledFor, contest, amount, prefillAmount]);
};
