"use client";
import AddFunds from "@components/AddFunds";
import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import Drawer from "@components/UI/Drawer";
import PushToFirstStat from "@components/VotingActionBar/components/PushToFirstStat";
import WinUpToStat from "@components/VotingActionBar/components/WinUpToStat";
import WouldWinNowStat from "@components/VotingActionBar/components/WouldWinNowStat";
import { UPVOTE_GRADIENT } from "@components/VotingActionBar/constants";
import FitTextGroup from "@components/VotingActionBar/FitTextGroup";
import useVotingInputDisplay from "@components/Voting/components/VoteAmountInput/hooks/useVotingInputDisplay";
import { useVoteExecution } from "@components/Voting/hooks/useVoteExecution";
import { useVotingStore } from "@components/Voting/store";
import { useModal } from "@getpara/react-sdk-lite";
import { formatVoteCount } from "@helpers/formatNumber";
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
import { useVoteProjections } from "@hooks/useVoteProjections";
import { useWallet } from "@hooks/useWallet";
import { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useShallow } from "zustand/shallow";

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
  const { inputValue, setInputValue } = useVotingStore(
    useShallow(state => ({ inputValue: state.inputValue, setInputValue: state.setInputValue })),
  );

  const { castVotes, isLoading: isCastLoading } = useCastVotes({ charge, votesClose });
  const { currentPriceNative } = usePriceCurveData();
  const { currentPricePerVote, isLoading: isPriceLoading } = useCurrentPricePerVote({
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

  const hasPrice = parseFloat(effectiveCost) > 0;
  const isGhost = !displayValue && hasPrice;
  const { displayValue: pricePerVoteDisplay } = useDisplayPrice(
    effectiveCost,
    contestConfig.chainNativeCurrencySymbol,
    undefined,
    undefined,
    { ceilingPrecision: true },
  );
  // Strip digit grouping so the placeholder is always typeable as shown.
  const placeholder = (pricePerVoteDisplay || "0").replace(/,/g, "");

  const valueString = displayValue || placeholder;
  const dotCount = (valueString.match(/\./g) || []).length;
  const charCount = valueString.length - dotCount * 0.5;

  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: inputFitRef, fontSize: inputFontSize } = useFitTextToBox<HTMLSpanElement>(valueString, 8, 20);

  const projections = useVoteProjections({
    proposalId: pickedProposal,
    spendNative: inputValue,
    pricePerVoteNative: effectiveCost,
    submissionsCount,
  });
  const { entryProjection } = projections;
  const totalVotes = projections.votes;
  const showProjection = projections.winUpTo.shouldShow;

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
    inputRef.current?.blur();
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

  const votesText = formatVoteCount(isGhost ? 1 : totalVotes);

  // Fill the raw native amount, not the display string — display can be abbreviated ("1.5m") or rate-rounded.
  const handlePushToFirstFill = () => {
    if (!projections.pushToFirstFillAmount) return;
    setInputValue(projections.pushToFirstFillAmount, maxBalance);
  };

  if (!slot) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className="mx-3 mb-2 rounded-[16px]"
        style={{
          padding: 1.5,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.16), 0 0 10px -6px rgba(255,255,255,0.14)",
        }}
      >
        <div className="flex items-center gap-1.5 rounded-[14.5px] bg-neutral-2 px-3 py-2.5">
          {/* amount input + votes it buys */}
          <div
            className="relative flex h-12 w-[88px] shrink-0 cursor-text flex-col items-center justify-center rounded-[24px] border border-neutral-9 px-2"
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            <span
              ref={inputFitRef}
              aria-hidden="true"
              className="invisible absolute left-0 top-0 block w-[56px] overflow-hidden whitespace-nowrap font-bold"
            >
              {valueString}
            </span>
            <div className="flex items-center gap-1">
              {displaySymbol === "$" && (
                <span
                  className="shrink-0 font-bold text-neutral-9"
                  style={{ fontSize: `${Math.round(inputFontSize * 0.6)}px` }}
                >
                  $
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={e => handleDisplayChange(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);

                  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
                }}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                aria-label="amount to spend"
                className="min-w-0 bg-transparent text-right font-bold text-neutral-11 placeholder-neutral-9 outline-none"
                style={{ fontSize: `${inputFontSize}px`, width: `${charCount || 1}ch`, maxWidth: "56px" }}
              />
              {displaySymbol !== "$" && (
                <span className="shrink-0 text-[11px] font-bold uppercase text-neutral-9">{displaySymbol}</span>
              )}
            </div>
            <span className="whitespace-nowrap text-[11px] leading-tight text-neutral-9">{votesText}</span>
          </div>

          {/* push to 1st / would win now + win up to */}
          <FitTextGroup>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
              {entryProjection?.kind === "pushToFirst" ? (
                <PushToFirstStat remainingToFirst={entryProjection.remainingToFirst} onFill={handlePushToFirstFill} />
              ) : entryProjection?.kind === "wouldWinNow" ? (
                <WouldWinNowStat amount={entryProjection.amount} isBelowSpend={entryProjection.isBelowSpend} />
              ) : null}

              {showProjection ? (
                <>
                  {entryProjection !== null && <div className="h-9 w-px shrink-0 bg-neutral-9" />}
                  <WinUpToStat amount={projections.winUpTo.amount} />
                </>
              ) : null}
            </div>
          </FitTextGroup>

          <button
            id={isConnected
                  ? (insufficientBalance ? "voting_add_funds_button" : "vote_button")
                  : undefined}
            onClick={handleClick}
            // Keep the input focused through the tap so the keyboard doesn't
            // collapse and shift the bar mid-press.
            onPointerDown={e => e.preventDefault()}
            disabled={isConnected && !insufficientBalance && voteDisabled}
            aria-label="back entry"
            className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-[14px] font-bold text-true-black transition-opacity disabled:opacity-50"
            style={{ backgroundImage: UPVOTE_GRADIENT }}
          >
            back entry
          </button>
        </div>
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
