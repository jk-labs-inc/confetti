"use client";
import AddFunds from "@components/AddFunds";
import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import Drawer from "@components/UI/Drawer";
import { useVotingRewardsProjection } from "@components/Voting/components/RewardsProjection/hooks";
import useVotingInputDisplay from "@components/Voting/components/VoteAmountInput/hooks/useVotingInputDisplay";
import { useVoteExecution } from "@components/Voting/hooks/useVoteExecution";
import { useVotingStore } from "@components/Voting/store";
import { useModal } from "@getpara/react-sdk-lite";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import useCastVotes from "@hooks/useCastVotes";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { useMobileNavSlot } from "@hooks/useMobileNavSlot";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { useProposalStore } from "@hooks/useProposal/store";
import { useVoteBalance } from "@hooks/useVoteBalance";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { useWallet } from "@hooks/useWallet";
import { CSSProperties, FC, useState } from "react";
import ReactDOM from "react-dom";
import { useShallow } from "zustand/shallow";

const UPVOTE_GRADIENT = "linear-gradient(90deg, #bb65ff 0%, #78ffc6 100%)";
const WIN_GRADIENT = "linear-gradient(180deg, #66DEFF 0%, #BB65FF 100%)";

/** Renders text that auto-shrinks to always fit its (fixed-width) box. */
const FitText: FC<{ text: string; min: number; max: number; className?: string; style?: CSSProperties }> = ({
  text,
  min,
  max,
  className,
  style,
}) => {
  const { ref, fontSize } = useFitTextToBox<HTMLSpanElement>(text, min, max);
  return (
    <span ref={ref} className={className} style={{ ...style, fontSize: `${fontSize}px` }}>
      {text}
    </span>
  );
};

const VotingActionBar = () => {
  const slot = useMobileNavSlot();
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const { charge, votesClose } = useContestStore(
    useShallow(state => ({ charge: state.charge, votesClose: state.votesClose })),
  );
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const submissionsCount = useProposalStore(useShallow(state => state.submissionsCount));
  const pickedProposal = useCastVotesStore(useShallow(state => state.pickedProposal));
  const { isConnected } = useWallet();
  const { openModal } = useModal();
  const inputValue = useVotingStore(useShallow(state => state.inputValue));

  const { castVotes, isLoading: isCastLoading } = useCastVotes({ charge, votesClose });
  const { currentPriceNative } = usePriceCurveData();
  const {
    currentPricePerVote,
    currentPricePerVoteRaw,
    isLoading: isPriceLoading,
  } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose: votesClose,
  });
  const effectiveCost = parseFloat(currentPriceNative) > 0 ? currentPriceNative : currentPricePerVote;

  const {
    balance,
    insufficientBalance,
    isLoading: isBalanceLoading,
  } = useVoteBalance({ chainId: contestConfig.chainId, costToVote: effectiveCost, inputValue });
  const maxBalance = balance?.formatted || "0";

  const { displayValue, displaySymbol, handleDisplayChange, setIsFocused } = useVotingInputDisplay({
    nativeCurrencySymbol: contestConfig.chainNativeCurrencySymbol,
    maxBalance,
    isConnected,
  });

  // The number font shrinks to keep any amount inside the fixed-width pill.
  const { ref: inputFitRef, fontSize: inputFontSize } = useFitTextToBox<HTMLInputElement>(displayValue || "0", 8, 26);

  const totalVotes = useVotesFromInput({ inputValue, costToVote: effectiveCost });

  const { winUpToFormatted, shouldShow: showProjection } = useVotingRewardsProjection({
    currentPricePerVote: currentPricePerVoteRaw,
    inputValue,
    submissionsCount,
  });
  const { displayValue: winValue, displaySymbol: winSymbol } = useDisplayPrice(
    winUpToFormatted,
    contestConfig.chainNativeCurrencySymbol,
  );

  const [showAddFunds, setShowAddFunds] = useState(false);

  const onVote = async (amountOfVotes: number) => {
    try {
      await castVotes(amountOfVotes);
    } catch {}
  };

  const { handleVote } = useVoteExecution({
    costToVote: effectiveCost,
    isVotingClosed: contestStatus === ContestStatus.VotingClosed,
    onVote,
  });

  const isZeroValue = !inputValue || parseFloat(inputValue) === 0;
  const isBelowMinimum = isConnected && !isZeroValue && totalVotes === 0;
  const voteDisabled =
    !pickedProposal || isBalanceLoading || isPriceLoading || isCastLoading || isZeroValue || isBelowMinimum;

  const handleClick = () => {
    if (isConnected && insufficientBalance) {
      setShowAddFunds(true);
      return;
    }
    if (!isConnected) {
      openModal();
      return;
    }
    if (!pickedProposal) return;
    handleVote();
  };

  const winDisplay = winSymbol === "$" ? `$${winValue}` : `${winValue} ${winSymbol}`;
  const votesDisplay = formatNumberWithCommas(totalVotes);
  const buttonLabel = !isConnected ? "sign in" : insufficientBalance ? "add funds" : null;

  if (!slot) return null;

  return ReactDOM.createPortal(
    <>
      <div className="flex items-center gap-2 border-t border-neutral-2 bg-true-black px-4 py-3">
        {/* amount input */}
        <div
          className="flex h-10 w-[104px] shrink-0 cursor-text items-center justify-center gap-1 rounded-full border border-neutral-9 px-3"
          onClick={() => inputFitRef.current?.focus()}
        >
          {displaySymbol === "$" && (
            <span
              className="shrink-0 font-bold text-neutral-9"
              style={{ fontSize: `${Math.round(inputFontSize * 0.6)}px` }}
            >
              $
            </span>
          )}
          <input
            ref={inputFitRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={e => handleDisplayChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="0"
            aria-label="amount to spend"
            className="w-[64px] bg-transparent text-center font-bold text-neutral-11 placeholder-neutral-9 outline-none"
            style={{ fontSize: `${inputFontSize}px` }}
          />
          {displaySymbol !== "$" && (
            <span className="shrink-0 text-[11px] font-bold uppercase text-neutral-9">{displaySymbol}</span>
          )}
        </div>

        {/* votes + win up to */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-center leading-tight">
            <span className="text-[13px] text-neutral-9">votes</span>
            <FitText
              text={votesDisplay}
              min={8}
              max={20}
              className="block w-full overflow-hidden whitespace-nowrap text-center text-neutral-11"
            />
          </div>

          {showProjection ? (
            <>
              <div className="h-9 w-px shrink-0 bg-neutral-9" />
              <div className="flex min-w-0 flex-1 flex-col items-center leading-tight">
                <span className="text-[13px] text-neutral-9">win up to</span>
                <FitText
                  text={winDisplay}
                  min={8}
                  max={20}
                  className="block w-full overflow-hidden whitespace-nowrap bg-clip-text text-center font-bold text-transparent"
                  style={{ backgroundImage: WIN_GRADIENT }}
                />
              </div>
            </>
          ) : null}
        </div>

        <button
          onClick={handleClick}
          disabled={isConnected && !insufficientBalance && voteDisabled}
          aria-label={isConnected ? (insufficientBalance ? "add funds" : "upvote") : "sign in"}
          className="flex h-10 w-20 shrink-0 items-center justify-center rounded-full px-1 font-bold text-true-black transition-opacity disabled:opacity-50"
          style={{ backgroundImage: UPVOTE_GRADIENT }}
        >
          {buttonLabel ? (
            <FitText
              text={buttonLabel}
              min={11}
              max={13}
              className="block w-full overflow-hidden whitespace-nowrap text-center"
            />
          ) : (
            <img src="/icons/upvote-black.svg" width={20} height={24} alt="upvote" className="shrink-0" />
          )}
        </button>
      </div>

      <Drawer
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        className="bg-true-black m-auto h-auto w-full md:max-w-[550px]"
      >
        <div className="p-6">
          <AddFunds
            chain={contestConfig.chainName}
            asset={contestConfig.chainNativeCurrencySymbol ?? ""}
            onGoBack={() => setShowAddFunds(false)}
          />
        </div>
      </Drawer>
    </>,
    slot,
  );
};

export default VotingActionBar;
