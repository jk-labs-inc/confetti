"use client";
import AddFunds from "@components/AddFunds";
import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import Drawer from "@components/UI/Drawer";
import FitText from "@components/VotingActionBar/FitText";
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
import { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useShallow } from "zustand/shallow";

const UPVOTE_GRADIENT = "linear-gradient(90deg, #bb65ff 0%, #78ffc6 100%)";
const WIN_GRADIENT = "linear-gradient(180deg, #66DEFF 0%, #BB65FF 100%)";

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
  const { ref: inputFitRef, fontSize: inputFontSize } = useFitTextToBox<HTMLSpanElement>(valueString, 8, 26);

  const totalVotes = useVotesFromInput({ inputValue, costToVote: effectiveCost });

  const { winUpToFormatted, shouldShow: showProjection } = useVotingRewardsProjection({
    currentPricePerVote: currentPricePerVoteRaw,
    inputValue: isGhost ? effectiveCost : inputValue,
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

  const winDisplay = winSymbol === "$" ? `$${winValue}` : `${winValue} ${winSymbol}`;
  const votesDisplay = isGhost ? "+1" : `+${formatNumberWithCommas(totalVotes)}`;

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
        <div className="flex items-center gap-2 rounded-[14.5px] bg-neutral-2 px-3 py-2.5">
          {/* amount input */}
          <div
            className="relative flex h-10 w-[104px] shrink-0 cursor-text items-center justify-center gap-1 rounded-full border border-neutral-9 px-3"
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            <span
              ref={inputFitRef}
              aria-hidden="true"
              className="invisible absolute left-0 top-0 block w-[64px] overflow-hidden whitespace-nowrap font-bold"
            >
              {valueString}
            </span>
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
              className="min-w-0 bg-transparent text-right font-bold text-neutral-11 outline-none"
              style={{ fontSize: `${inputFontSize}px`, width: `${charCount || 1}ch`, maxWidth: "64px" }}
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
                className={`block w-full overflow-hidden whitespace-nowrap text-center ${
                  isGhost ? "text-neutral-9" : "text-neutral-11"
                }`}
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
                    className={`block w-full overflow-hidden whitespace-nowrap text-center font-bold ${
                      isGhost ? "text-neutral-9" : "bg-clip-text text-transparent"
                    }`}
                    style={isGhost ? undefined : { backgroundImage: WIN_GRADIENT }}
                  />
                </div>
              </>
            ) : null}
          </div>

          <button
            id="vote_button"
            onClick={handleClick}
            // Keep the input focused through the tap so the keyboard doesn't
            // collapse and shift the bar mid-press.
            onPointerDown={e => e.preventDefault()}
            disabled={isConnected && !insufficientBalance && voteDisabled}
            aria-label="buy votes"
            className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[14px] font-bold text-true-black transition-opacity disabled:opacity-50"
            style={{ backgroundImage: UPVOTE_GRADIENT }}
          >
            buy votes
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
