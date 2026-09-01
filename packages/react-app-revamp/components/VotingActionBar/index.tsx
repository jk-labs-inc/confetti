"use client";
import AddFunds from "@components/AddFunds";
import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import Drawer from "@components/UI/Drawer";
import NumericKeypad from "@components/UI/NumericKeypad";
import { useRunAfterOverlayDismissed } from "@components/UI/TransactionOverlay/useRunAfterOverlayDismissed";
import FocusModeEntryPreview from "@components/VotingActionBar/components/FocusModeEntryPreview";
import FocusModeScrim from "@components/VotingActionBar/components/FocusModeScrim";
import PushToFirstStat from "@components/VotingActionBar/components/PushToFirstStat";
import WinUpToStat from "@components/VotingActionBar/components/WinUpToStat";
import WouldWinNowStat from "@components/VotingActionBar/components/WouldWinNowStat";
import { UPVOTE_GRADIENT } from "@components/VotingActionBar/constants";
import FitTextGroup from "@components/VotingActionBar/FitTextGroup";
import { useVotingFocusModeStore } from "@components/VotingActionBar/store";
import { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import VotePercentRow from "@components/Voting/components/VotePercentRow";
import useVotingInputDisplay from "@components/Voting/components/VoteAmountInput/hooks/useVotingInputDisplay";
import useKeypadInput from "@components/Voting/hooks/useKeypadInput";
import { useVoteExecution } from "@components/Voting/hooks/useVoteExecution";
import { useVotingStore } from "@components/Voting/store";
import { useModal } from "@getpara/react-sdk-lite";
import { formatVoteCount } from "@helpers/formatNumber";
import { useAddFunds } from "@hooks/useAddFunds";
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
import { AnimatePresence, motion } from "motion/react";
import { FC, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useShallow } from "zustand/shallow";

interface VotingActionBarProps {
  entryPreview?: EntryPreviewHeaderProps;
  isVotingClosed?: boolean;
  onClose?: () => void;
  onVoteSuccess?: (result: { proposalId: string; amountOfVotes: number }) => void;
}

const VotingActionBar: FC<VotingActionBarProps> = ({ entryPreview, isVotingClosed, onClose, onVoteSuccess }) => {
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
  const { inputValue, setInputValue, resetVotingInput } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      setInputValue: state.setInputValue,
      resetVotingInput: state.reset,
    })),
  );
  const { isFocusMode, setIsFocusMode } = useVotingFocusModeStore(
    useShallow(state => ({ isFocusMode: state.isFocusMode, setIsFocusMode: state.setIsFocusMode })),
  );
  const runAfterOverlayDismissed = useRunAfterOverlayDismissed();
  const isFlowMode = Boolean(onClose);

  useEffect(() => {
    if (!isFlowMode) return;
    resetVotingInput();
    setIsFocusMode(true);
  }, [isFlowMode, resetVotingInput, setIsFocusMode]);

  useEffect(() => () => setIsFocusMode(false), [setIsFocusMode]);

  const { castVotes, isLoading: isCastLoading } = useCastVotes({ charge, votesClose });
  const { currentPriceNative } = usePriceCurveData();
  const { currentPricePerVote, isLoading: isPriceLoading } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose: votesClose,
  });
  const effectiveCost = parseFloat(currentPriceNative) > 0 ? currentPriceNative : currentPricePerVote;

  const { openAddFunds } = useAddFunds({ chain: contestConfig.chainName });

  const {
    balance,
    insufficientBalance,
    isLoading: isBalanceLoading,
  } = useVoteBalance({
    chainId: contestConfig.chainId,
    costToVote: effectiveCost,
    inputValue,
  });
  const maxBalance = balance?.formatted || "0";

  const { displayValue, displaySymbol, handleDisplayChange } = useVotingInputDisplay({
    nativeCurrencySymbol: contestConfig.chainNativeCurrencySymbol,
    maxBalance,
    isConnected,
  });
  const { handleKey } = useKeypadInput({ displayValue, onDisplayChange: handleDisplayChange });

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
      if (pickedProposal) onVoteSuccess?.({ proposalId: pickedProposal, amountOfVotes });
    } catch {
    } finally {
      if (onClose) runAfterOverlayDismissed(onClose);
    }
  };

  const { handleVote } = useVoteExecution({
    costToVote: effectiveCost,
    isVotingClosed: isVotingClosed ?? contestStatus === ContestStatus.VotingClosed,
    onVote,
  });

  const isZeroValue = !inputValue || parseFloat(inputValue) === 0;
  const isBelowMinimum = !isZeroValue && totalVotes === 0;
  const voteDisabled =
    !pickedProposal || isBalanceLoading || isPriceLoading || isCastLoading || isZeroValue || isBelowMinimum;

  const handleClick = async () => {
    if (isConnected && insufficientBalance) {
      if (await openAddFunds()) return;
      setIsFocusMode(false);
      setShowAddFunds(true);
      return;
    }
    if (!isConnected) {
      openModal();
      return;
    }
    if (!pickedProposal) return;
    setIsFocusMode(false);
    handleVote();
  };

  const handleAddFundsClose = () => {
    setShowAddFunds(false);
    setIsFocusMode(true);
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
      <FocusModeScrim
        isVisible={isFocusMode}
        onDismiss={() => {
          setIsFocusMode(false);
          onClose?.();
        }}
      />

      {isFocusMode && <FocusModeEntryPreview entryPreview={entryPreview} />}

      <div
        className="mx-3 mb-2 rounded-[16px]"
        style={{
          padding: 1.5,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.16), 0 0 10px -6px rgba(255,255,255,0.14)",
        }}
      >
        <div
          className="flex cursor-pointer items-center gap-1.5 rounded-[14.5px] bg-neutral-2 px-3 py-2.5"
          onClick={() => setIsFocusMode(true)}
        >
          {/* amount input + votes it buys */}
          <div
            className={`relative flex h-12 w-[88px] shrink-0 flex-col items-center justify-center rounded-[24px] border px-2 transition-colors duration-200 ${
              isFocusMode ? "border-secondary-11" : "border-neutral-9"
            }`}
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
                type="text"
                inputMode="none"
                readOnly
                tabIndex={-1}
                value={displayValue}
                placeholder={placeholder}
                aria-label="amount to spend"
                className="pointer-events-none min-w-0 bg-transparent text-right font-bold text-neutral-11 placeholder-neutral-9 outline-none"
                style={{ fontSize: `${inputFontSize}px`, width: `${charCount || 1}ch`, maxWidth: "56px" }}
              />
              {isFocusMode && (
                <span
                  aria-hidden="true"
                  className="w-[1.5px] shrink-0 animate-caret-blink rounded-full bg-neutral-11"
                  style={{ height: Math.round(inputFontSize * 0.85) }}
                />
              )}
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
            onClick={e => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={isConnected && insufficientBalance ? false : voteDisabled}
            aria-label="back entry"
            className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-[14px] font-bold text-true-black transition-opacity disabled:opacity-50"
            style={{ backgroundImage: UPVOTE_GRADIENT }}
          >
            back entry
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
              <VotePercentRow maxBalance={maxBalance} isConnected={isConnected} />
              <NumericKeypad onKey={handleKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer
        isOpen={showAddFunds}
        onClose={handleAddFundsClose}
        className="bg-true-black m-auto h-auto w-full md:max-w-[550px]"
      >
        <div className="p-6">
          <AddFunds
            chain={contestConfig.chainName}
            asset={contestConfig.chainNativeCurrencySymbol ?? ""}
            onGoBack={handleAddFundsClose}
          />
        </div>
      </Drawer>
    </>,
    slot,
  );
};

export default VotingActionBar;
