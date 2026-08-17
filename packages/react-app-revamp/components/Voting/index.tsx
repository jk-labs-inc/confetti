import { useModal } from "@getpara/react-sdk-lite";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useVoteBalance } from "@hooks/useVoteBalance";
import { useVoteProjections } from "@hooks/useVoteProjections";
import { useWallet } from "@hooks/useWallet";
import { FC, RefObject, useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import VotingWidgetRewardsProjection from "./components/RewardsProjection";
import VotingWidgetSignup from "./components/Signup";
import VoteAmountInput from "./components/VoteAmountInput";
import VoteButton from "./components/VoteButton";
import VoteInfoBlocks from "./components/VoteInfoBlocks";
import { useEffectiveCostToVote } from "./hooks/useEffectiveCostToVote";
import { useVoteExecution } from "./hooks/useVoteExecution";
import { useVotingStore } from "./store";
import { AddFundsEntryReason } from "./types";

export enum VotingWidgetStyle {
  classic = "classic",
  colored = "colored",
}

interface VotingWidgetProps {
  costToVote: string;
  isLoading: boolean;
  isVotingClosed: boolean;
  isContestCanceled: boolean;
  submissionsCount: number;
  style?: VotingWidgetStyle;
  onVote?: (amountOfVotes: number) => void;
  onAddFunds?: (reason: AddFundsEntryReason) => void;
  onConnectRequest?: () => void;
}

const VotingWidget: FC<VotingWidgetProps> = ({
  costToVote,
  isLoading,
  isVotingClosed,
  isContestCanceled,
  submissionsCount,
  style = VotingWidgetStyle.classic,
  onVote,
  onAddFunds,
  onConnectRequest,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { isConnected } = useWallet();
  const { openModal } = useModal();
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValue = useVotingStore(state => state.inputValue);
  const effectiveCostToVote = useEffectiveCostToVote(costToVote);
  const {
    balance,
    insufficientBalance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useVoteBalance({
    chainId: contestConfig.chainId,
    costToVote: effectiveCostToVote,
    inputValue,
  });
  const { handleVote } = useVoteExecution({
    costToVote: effectiveCostToVote,
    isVotingClosed,
    onVote,
  });
  const pickedProposal = useCastVotesStore(useShallow(state => state.pickedProposal));
  const projections = useVoteProjections({
    proposalId: pickedProposal,
    spendNative: inputValue,
    pricePerVoteNative: effectiveCostToVote,
    submissionsCount,
  });

  useEffect(() => {
    if (isMobile) return;

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  const totalVotes = projections.votes;
  const isZeroValue = !inputValue || parseFloat(inputValue) === 0;
  const isBelowMinimum = !isZeroValue && totalVotes === 0;
  const voteDisabled = isZeroValue || isBelowMinimum || isLoading || (isConnected && isBalanceLoading);

  const handlePrimaryAction = () => {
    if (voteDisabled) return;
    if (!isConnected) {
      if (onConnectRequest) {
        onConnectRequest();
      } else {
        openModal();
      }
      return;
    }
    if (insufficientBalance) {
      onAddFunds?.(AddFundsEntryReason.Shortfall);
      return;
    }
    handleVote();
  };

  const handleKeyDownInputWithVote = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePrimaryAction();
    }
  };

  if (isContestCanceled) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <VoteAmountInput
            maxBalance={balance?.formatted || "0"}
            symbol={contestConfig.chainNativeCurrencySymbol}
            costToVote={effectiveCostToVote}
            isConnected={isConnected}
            isBelowMinimum={isBelowMinimum}
            pushToFirstAmount={projections.pushToFirstFillAmount}
            style={style}
            autoFocus={!isMobile}
            inputRef={inputRef as RefObject<HTMLInputElement>}
            onKeyDown={handleKeyDownInputWithVote}
          />
          <VoteInfoBlocks
            type="my-votes"
            balance={isBalanceError ? "Error loading balance" : balance?.formatted || "0"}
            symbol={contestConfig.chainNativeCurrencySymbol}
            insufficientBalance={insufficientBalance}
            isConnected={isConnected}
            onAddFunds={() => onAddFunds?.(AddFundsEntryReason.Manual)}
          />
      </div>

      <div className="flex flex-col gap-4">
        <VotingWidgetRewardsProjection projections={projections} />
        <VotingWidgetSignup />
        <VoteButton
          isDisabled={voteDisabled}
          isInvalidBalance={insufficientBalance && isConnected}
          isConnected={isConnected}
          onClick={handlePrimaryAction}
        />
      </div>
    </div>
  );
};

export default VotingWidget;
