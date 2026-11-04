import { useEffectiveCostToVote } from "@components/Voting/hooks/useEffectiveCostToVote";
import { useVoteExecution } from "@components/Voting/hooks/useVoteExecution";
import { useVotingStore } from "@components/Voting/store";
import { AddFundsEntryReason, VoteFlowScreen } from "@components/Voting/types";
import { useModal } from "@getpara/react-sdk-lite";
import { useAddFunds, DEPOSIT_ARRIVAL_POLL_INTERVAL_MS } from "@hooks/useAddFunds";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useVoteBalance } from "@hooks/useVoteBalance";
import { useWallet } from "@hooks/useWallet";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

const CONNECT_RESOLUTION_GRACE_MS = 3_000;

interface UseVoteFlowControllerParams {
  isOpen: boolean;
  costToVote: string;
  isVotingClosed: boolean;
  isContestCanceled: boolean;
  onVote?: (amountOfVotes: number) => void;
}

interface UseVoteFlowControllerReturn {
  screen: VoteFlowScreen;
  effectiveCostToVote: string;
  goToVote: () => void;
  goToAddFunds: (reason: AddFundsEntryReason) => void;
  requestConnectAndVote: () => void;
  confirmVote: () => Promise<void>;
  handleBridgeSuccess: () => void;
}

export const useVoteFlowController = ({
  isOpen,
  costToVote,
  isVotingClosed,
  isContestCanceled,
  onVote,
}: UseVoteFlowControllerParams): UseVoteFlowControllerReturn => {
  const [screen, setScreen] = useState(VoteFlowScreen.Vote);
  const [addFundsEntryReason, setAddFundsEntryReason] = useState(AddFundsEntryReason.Shortfall);
  const [isConnectIntentPending, setIsConnectIntentPending] = useState(false);
  const intentFiredRef = useRef(false);

  const { isConnected } = useWallet();
  const { isOpen: isParaModalOpen, openModal } = useModal();
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const effectiveCostToVote = useEffectiveCostToVote(costToVote);

  const { openAddFunds } = useAddFunds({ chain: contestConfig.chainName });

  const {
    balance,
    spendableBalance,
    insufficientBalance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetchBalance,
  } = useVoteBalance({
    chainId: contestConfig.chainId,
    costToVote: effectiveCostToVote,
    refetchIntervalMs: screen === VoteFlowScreen.AddFunds ? DEPOSIT_ARRIVAL_POLL_INTERVAL_MS : undefined,
  });

  const { handleVote } = useVoteExecution({
    costToVote: effectiveCostToVote,
    isVotingClosed,
    onVote,
  });

  const handleVoteRef = useRef(handleVote);
  useEffect(() => {
    handleVoteRef.current = handleVote;
  });

  const confirmVote = useCallback(async () => {
    try {
      await handleVoteRef.current();
    } catch {}
  }, []);

  const goToVote = useCallback(() => setScreen(VoteFlowScreen.Vote), []);

  const goToAddFunds = useCallback(
    (reason: AddFundsEntryReason) => {
      openAddFunds().then(opened => {
        if (opened) return;
        setAddFundsEntryReason(reason);
        setScreen(VoteFlowScreen.AddFunds);
      });
    },
    [openAddFunds],
  );

  const requestConnectAndVote = useCallback(() => {
    intentFiredRef.current = false;
    setIsConnectIntentPending(true);
    openModal();
  }, [openModal]);

  const handleBridgeSuccess = useCallback(() => {
    if (addFundsEntryReason === AddFundsEntryReason.Shortfall) {
      refetchBalance?.();
    } else {
      setScreen(VoteFlowScreen.Vote);
    }
  }, [addFundsEntryReason, refetchBalance]);

  useEffect(() => {
    if (!isOpen || !isConnectIntentPending || !isConnected || isContestCanceled) return;
    if (isBalanceError) {
      setIsConnectIntentPending(false);
      return;
    }
    if (isBalanceLoading || balance === undefined) return;
    if (intentFiredRef.current) return;
    intentFiredRef.current = true;
    setIsConnectIntentPending(false);
    const typedAmount = parseFloat(useVotingStore.getState().inputValue);
    const isShortfall = insufficientBalance || (!isNaN(typedAmount) && typedAmount > parseFloat(spendableBalance));
    if (isShortfall) {
      goToAddFunds(AddFundsEntryReason.Shortfall);
    } else {
      confirmVote();
    }
  }, [
    isOpen,
    isConnectIntentPending,
    isConnected,
    isContestCanceled,
    isBalanceError,
    isBalanceLoading,
    balance,
    spendableBalance,
    insufficientBalance,
    goToAddFunds,
    confirmVote,
  ]);

  useEffect(() => {
    if (!isConnectIntentPending || isParaModalOpen || isConnected) return;
    const timer = setTimeout(() => setIsConnectIntentPending(false), CONNECT_RESOLUTION_GRACE_MS);
    return () => clearTimeout(timer);
  }, [isConnectIntentPending, isParaModalOpen, isConnected]);

  useEffect(() => {
    if (!isOpen || screen !== VoteFlowScreen.AddFunds || addFundsEntryReason !== AddFundsEntryReason.Shortfall) {
      return;
    }
    if (!isConnected || isBalanceLoading || isBalanceError || balance === undefined) return;
    const typedAmount = parseFloat(useVotingStore.getState().inputValue);
    if (isNaN(typedAmount) || typedAmount === 0) return;
    if (insufficientBalance || typedAmount > parseFloat(spendableBalance)) return;
    setScreen(VoteFlowScreen.Confirm);
  }, [
    isOpen,
    screen,
    addFundsEntryReason,
    isConnected,
    isBalanceLoading,
    isBalanceError,
    balance,
    spendableBalance,
    insufficientBalance,
  ]);

  useEffect(() => {
    if (isOpen) return;
    setScreen(VoteFlowScreen.Vote);
    setAddFundsEntryReason(AddFundsEntryReason.Shortfall);
    setIsConnectIntentPending(false);
    intentFiredRef.current = false;
  }, [isOpen]);

  return {
    screen,
    effectiveCostToVote,
    goToVote,
    goToAddFunds,
    requestConnectAndVote,
    confirmVote,
    handleBridgeSuccess,
  };
};
