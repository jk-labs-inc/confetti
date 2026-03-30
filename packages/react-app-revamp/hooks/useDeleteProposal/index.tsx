import { toastLoading, toastSuccess } from "@components/UI/Toast";
import DeployedContestContract from "@contracts/bytecodeAndAbi/Contest.sol/Contest.json";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { getChainFromId } from "@helpers/getChainFromId";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { useError } from "@hooks/useError";
import useProposal from "@hooks/useProposal";
import { useWallet } from "@hooks/useWallet";
import { simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { saveUpdatedProposalsStatusToAnalyticsV3 } from "lib/analytics/participants";
import { useEffect } from "react";
import { Abi } from "viem";
import { useShallow } from "zustand/shallow";
import { useDeleteProposalStore } from "./store";

export const ENTRANT_CAN_DELETE_VERSION = "5.3";

export function useDeleteProposal() {
  const { abi, version, contestConfig } = useContestConfigStore(
    useShallow(state => ({
      contestConfig: state.contestConfig,
      abi: state.contestConfig.abi,
      version: state.contestConfig.version,
    })),
  );
  const { userAddress } = useWallet();
  const chain = getChainFromId(contestConfig.chainId);
  const contestChainBlockExplorer = chain?.blockExplorers?.default?.url;
  const { removeProposal } = useProposal();
  const {
    isLoading,
    error,
    isSuccess,
    transactionData,
    isModalOpen,
    setIsLoading,
    setIsSuccess,
    setError,
    setTransactionData,
    resetStore,
  } = useDeleteProposalStore(state => state);
  const { error: errorMessage, handleError } = useError();

  async function deleteProposal(proposalIds: string[]) {
    toastLoading({
      message: "Deleting proposal...",
    });
    setIsLoading(true);
    setIsSuccess(false);
    setError("");
    setTransactionData(null);

    const contractConfig = {
      address: contestConfig.address as `0x${string}`,
      abi: abi ? abi : (DeployedContestContract.abi as Abi),
      chainId: contestConfig.chainId,
    };

    if (!contractConfig.abi) return;

    try {
      const { request } = await simulateContract(getWagmiConfig(), {
        ...contractConfig,
        functionName: "deleteProposals",
        args: [proposalIds],
      });

      const hash = await writeContract(getWagmiConfig(), {
        ...request,
      });

      const receipt = await waitForTransactionReceipt(getWagmiConfig(), {
        chainId: contestConfig.chainId,
        hash: hash,
        confirmations: 2,
      });

      setTransactionData({
        hash: receipt.transactionHash,
        chainId: contestConfig.chainId,
        transactionHref: `${contestChainBlockExplorer}/tx/${hash}`,
      });

      try {
        if (!userAddress) return;

        await saveUpdatedProposalsStatusToAnalyticsV3(
          userAddress,
          contestConfig.address,
          contestConfig.chainName,
          proposalIds,
        );
      } catch (error: any) {
        console.error("Error saving updated proposals status to analytics", error.message);
      }

      removeProposal(proposalIds);
      setIsLoading(false);
      setIsSuccess(true);
      toastSuccess({
        message: "Proposal deleted successfully!",
      });
    } catch (e) {
      handleError(e, `something went wrong and the proposal couldn't be deleted`);
      setError(errorMessage);
      setIsLoading(false);
      setIsSuccess(false);
    }
  }

  function isEntrantCanDeleteVersion() {
    return compareVersions(version, ENTRANT_CAN_DELETE_VERSION) >= 0;
  }

  function canDeleteProposal(
    userAddress: string | undefined,
    contestAuthorAddress: string,
    proposalAuthorAddress: string,
    contestStatus: ContestStatus,
  ) {
    const isContestAuthor = userAddress === contestAuthorAddress;
    const isProposalAuthor = userAddress === proposalAuthorAddress;
    const canEntrantDelete = isEntrantCanDeleteVersion();

    return (
      contestStatus === ContestStatus.SubmissionOpen && (isContestAuthor || (canEntrantDelete && isProposalAuthor))
    );
  }

  useEffect(() => {
    if (!isModalOpen) {
      setIsLoading(false);
      setIsSuccess(false);
      setTransactionData({});
      setError("");
    }
  }, [isModalOpen, setError, setIsLoading, setIsSuccess, setTransactionData]);

  return {
    deleteProposal,
    isLoading,
    error,
    isSuccess,
    transactionData,
    isEntrantCanDeleteVersion,
    canDeleteProposal,
    resetStore,
  };
}

export default useDeleteProposal;
