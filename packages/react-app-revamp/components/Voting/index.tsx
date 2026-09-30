import NumericKeypad from "@components/UI/NumericKeypad";
import { useModal } from "@getpara/react-sdk-lite";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
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
import useVotingInputDisplay from "./components/VoteAmountInput/hooks/useVotingInputDisplay";
import VoteButton from "./components/VoteButton";
import VoteInfoBlocks from "./components/VoteInfoBlocks";
import VotePercentRow from "./components/VotePercentRow";
import { useEffectiveCostToVote } from "./hooks/useEffectiveCostToVote";
import useKeypadInput from "./hooks/useKeypadInput";
import { useVoteExecution } from "./hooks/useVoteExecution";
import { useVotingStore } from "./store";
import { AddFundsEntryReason, VotingWidgetLayout } from "./types";

export enum VotingWidgetStyle {
  classic = "classic",
  muted = "muted",
}

interface VotingWidgetProps {
  costToVote: string;
  isLoading: boolean;
  isVotingClosed: boolean;
  isContestCanceled: boolean;
  submissionsCount: number;
  style?: VotingWidgetStyle;
  layout?: VotingWidgetLayout;
  onVote?: (amountOfVotes: number) => void;
  onAddFunds?: (reason: AddFundsEntryReason) => void;
  onConnectRequest?: () => void;
  pinVoteButton?: boolean;
}

const PINNED_VOTE_BUTTON_CLASS_NAME = "sticky bottom-0 z-10 -mx-3 -mb-3 px-3 pb-3 pt-6 -mt-6 rounded-b-2xl";
const PINNED_VOTE_BUTTON_BACKDROP = "linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, #141414 40%)";

const VotingWidget: FC<VotingWidgetProps> = ({
  costToVote,
  isLoading,
  isVotingClosed,
  isContestCanceled,
  submissionsCount,
  style = VotingWidgetStyle.classic,
  layout = VotingWidgetLayout.regular,
  onVote,
  onAddFunds,
  onConnectRequest,
  pinVoteButton = false,
}) => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });
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
  const maxBalance = balance?.formatted || "0";
  const {
    displayValue,
    displaySymbol,
    isLoading: isDisplayLoading,
    handleDisplayChange,
    handleDisplayMax,
  } = useVotingInputDisplay({
    nativeCurrencySymbol: contestConfig.chainNativeCurrencySymbol,
    maxBalance,
    isConnected,
  });
  const { handleKey } = useKeypadInput({ displayValue, onDisplayChange: handleDisplayChange });
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
          maxBalance={maxBalance}
          symbol={contestConfig.chainNativeCurrencySymbol}
          costToVote={effectiveCostToVote}
          isConnected={isConnected}
          displayValue={displayValue}
          displaySymbol={displaySymbol}
          isDisplayLoading={isDisplayLoading}
          onDisplayChange={handleDisplayChange}
          onDisplayMax={handleDisplayMax}
          isBelowMinimum={isBelowMinimum}
          pushToFirstAmount={projections.pushToFirstFillAmount}
          style={style}
          layout={layout}
          autoFocus={!isMobile}
          isReadOnly={isMobile}
          showPresets={!isMobile}
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
          layout={layout}
        />
      </div>

      <div className="flex flex-col gap-4">
        <VotingWidgetRewardsProjection projections={projections} layout={layout} />
        <VotingWidgetSignup />
        {isMobile && (
          <div className="flex flex-col gap-4">
            <VotePercentRow maxBalance={maxBalance} isConnected={isConnected} />
            <NumericKeypad onKey={handleKey} />
          </div>
        )}
        <div
          className={pinVoteButton ? PINNED_VOTE_BUTTON_CLASS_NAME : ""}
          style={pinVoteButton ? { background: PINNED_VOTE_BUTTON_BACKDROP } : undefined}
        >
          <VoteButton
            isDisabled={voteDisabled}
            isInvalidBalance={insufficientBalance && isConnected}
            isConnected={isConnected}
            onClick={handlePrimaryAction}
          />
        </div>
      </div>
    </div>
  );
};

export default VotingWidget;
