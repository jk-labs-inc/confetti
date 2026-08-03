import { toastInfo } from "@components/UI/Toast";
import { useVotingStore } from "@components/Voting/store";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useWallet } from "@hooks/useWallet";
import { switchChain } from "@wagmi/core";
import { votesFromSpend } from "lib/voteProjections";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";

interface UseVoteExecutionProps {
  costToVote: string;
  isVotingClosed: boolean;
  onVote?: (amountOfVotes: number) => void;
}

interface UseVoteExecutionReturn {
  handleVote: () => Promise<void>;
}

export const useVoteExecution = ({
  costToVote,
  isVotingClosed,
  onVote,
}: UseVoteExecutionProps): UseVoteExecutionReturn => {
  const { chain } = useWallet();
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const isCorrectNetwork = chain?.id === contestConfig.chainId;
  const inputValue = useVotingStore(useShallow(state => state.inputValue));

  const onSwitchNetwork = async (chainId: number) => {
    await switchChain(getWagmiConfig(), { chainId });
  };

  const handleVote = useCallback(async () => {
    if (!isCorrectNetwork) {
      await onSwitchNetwork(contestConfig.chainId);
    }

    if (isVotingClosed) {
      toastInfo({
        message: "Voting is closed for this contest",
      });
      return;
    }

    onVote?.(votesFromSpend(inputValue, costToVote));
  }, [isCorrectNetwork, contestConfig.chainId, isVotingClosed, costToVote, inputValue, onVote]);

  return {
    handleVote,
  };
};
