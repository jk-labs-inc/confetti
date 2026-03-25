import useContestConfigStore from "@hooks/useContestConfig/store";
import { useVoteBalance } from "@hooks/useVoteBalance";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { useWallet } from "@hooks/useWallet";
import { FC, RefObject, useEffect, useRef, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import VotingWidgetEmailSignup from "./components/EmailSignup";
import VotingWidgetRewardsProjection from "./components/RewardsProjection";
import VoteAmountInput from "./components/VoteAmountInput";
import VoteButton from "./components/VoteButton";
import VoteInfoBlocks from "./components/VoteInfoBlocks";
import { useVoteExecution } from "./hooks/useVoteExecution";
import { useVotingStore } from "./store";

export enum VotingWidgetStyle {
  classic = "classic",
  colored = "colored",
}

interface VotingWidgetProps {
  costToVote: string;
  costToVoteRaw: bigint;
  isLoading: boolean;
  isVotingClosed: boolean;
  isContestCanceled: boolean;
  submissionsCount: number;
  style?: VotingWidgetStyle;
  onVote?: (amountOfVotes: number) => void;
  onAddFunds?: () => void;
}

const VotingWidget: FC<VotingWidgetProps> = ({
  costToVote,
  costToVoteRaw,
  isLoading,
  isVotingClosed,
  isContestCanceled,
  submissionsCount,
  style = VotingWidgetStyle.classic,
  onVote,
  onAddFunds,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { isConnected } = useWallet();
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const inputRef = useRef<HTMLInputElement>(null);
  const { inputValue, isInvalid } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      isInvalid: state.isInvalid,
    })),
  );
  const {
    balance,
    insufficientBalance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useVoteBalance({
    chainId: contestConfig.chainId,
    costToVote,
    inputValue,
  });
  const { handleVote } = useVoteExecution({
    costToVote,
    isVotingClosed,
    onVote,
  });

  useEffect(() => {
    if (isMobile) return;

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  const hasBalance = parseFloat(balance?.formatted || "0") > 0;
  const totalVotes = useVotesFromInput({ inputValue, costToVote });
  const isZeroValue = !inputValue || parseFloat(inputValue) === 0;
  const isBelowMinimum = isConnected && !isZeroValue && totalVotes === 0;
  const voteDisabled = isBalanceLoading || isLoading || isInvalid || isZeroValue || isBelowMinimum;

  const handleKeyDownInputWithVote = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVote();
    }
  };

  if (isContestCanceled) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <VoteAmountInput
            maxBalance={balance?.formatted || "0"}
            symbol={contestConfig.chainNativeCurrencySymbol}
            costToVote={costToVote}
            isConnected={isConnected}
            isBelowMinimum={isBelowMinimum}
            style={style}
            inputRef={inputRef as RefObject<HTMLInputElement>}
            onKeyDown={handleKeyDownInputWithVote}
          />
          <VoteInfoBlocks
            type="my-votes"
            balance={isBalanceError ? "Error loading balance" : balance?.formatted || "0"}
            symbol={contestConfig.chainNativeCurrencySymbol}
            insufficientBalance={insufficientBalance}
            isConnected={isConnected}
            onAddFunds={onAddFunds}
          />
      </div>

      <div className="flex flex-col gap-4">
        <VotingWidgetRewardsProjection
          currentPricePerVote={costToVoteRaw}
          inputValue={inputValue}
          submissionsCount={submissionsCount}
        />
        <VotingWidgetEmailSignup />
        <VoteButton
          isDisabled={voteDisabled}
          isInvalidBalance={insufficientBalance && isConnected}
          isConnected={isConnected}
          onVote={handleVote}
          onAddFunds={onAddFunds}
        />
      </div>
    </div>
  );
};

export default VotingWidget;
