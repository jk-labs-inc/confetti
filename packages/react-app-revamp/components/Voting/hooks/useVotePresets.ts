import { MAX_PERCENT } from "@components/Voting/components/VoteAmountInput/constants";
import type { VotePresets } from "@components/Voting/components/VoteAmountInput/types";
import { useVotingStore } from "@components/Voting/store";
import { useShallow } from "zustand/shallow";

interface UseVotePresetsParams {
  maxBalance: string;
  isConnected: boolean;
  pushToFirstFillAmount: string | null;
  allowPercentPresets: boolean;
  onMax: () => void;
}

export const useVotePresets = ({
  maxBalance,
  isConnected,
  pushToFirstFillAmount,
  allowPercentPresets,
  onMax,
}: UseVotePresetsParams): VotePresets | null => {
  const { setInputValue, setSliderValue } = useVotingStore(
    useShallow(state => ({
      setInputValue: state.setInputValue,
      setSliderValue: state.setSliderValue,
    })),
  );

  const showPercentPresets = allowPercentPresets && parseFloat(maxBalance) > 0 && isConnected;
  const showPushToFirst = Boolean(pushToFirstFillAmount);

  if (!showPushToFirst && !showPercentPresets) return null;

  return {
    showPushToFirst,
    showPercentPresets,
    onPreset: percent => {
      if (percent === MAX_PERCENT) {
        onMax();
      } else {
        setSliderValue(percent, maxBalance, isConnected);
      }
    },
    onPushToFirst: () => {
      if (pushToFirstFillAmount) {
        setInputValue(pushToFirstFillAmount, maxBalance);
      }
    },
  };
};
