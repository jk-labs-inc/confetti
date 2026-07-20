import { toastLoading, toastSuccess } from "@components/UI/Toast";
import { LoadingToastMessageType } from "@components/UI/Toast/components/Loading";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { getProposalId } from "@helpers/getProposalId";
import { generateEntryPreviewHTML, processFieldInputs } from "@helpers/metadata";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { Charge } from "@hooks/useDeployContest/types";
import useEntryTitleResolver from "@hooks/useEntryTitleResolver";
import { useError } from "@hooks/useError";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import useProposal from "@hooks/useProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import { useWallet } from "@hooks/useWallet";
import { simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { safeCompareVersions } from "@helpers/versions";
import { CONTEST_ENTRY_TYPE_VERSION } from "constants/versions";
import { addUserActionForAnalytics } from "lib/analytics/participants";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import { useSubmitProposalStore } from "./store";
import { safeMetadata, targetMetadata } from "./constants";

interface UserAnalyticsParams {
  address: string;
  userAddress: `0x${string}` | undefined;
  chainName: string;
  proposalId: string;
  proposalName?: string;
  charge: Charge;
}

export function useSubmitProposal() {
  const { userAddress, chain } = useWallet();
  const { contestConfig } = useContestConfigStore(state => state);
  const isMobile = useMediaQuery({ maxWidth: "768px" });
  const showToast = !isMobile;
  const charge = useContestStore(useShallow(state => state.charge));
  const { error: errorMessage, handleError } = useError();
  const { fetchSingleProposal } = useProposal();
  const { setSubmissionsCount, submissionsCount } = useProposalStore(state => state);
  const { isLoading, isSuccess, error, setIsLoading, setIsSuccess, setError, setTransactionData } =
    useSubmitProposalStore(state => state);
  const { fields: metadataFields, setFields: setMetadataFields } = useMetadataStore(state => state);
  const resolveEntryTitle = useEntryTitleResolver();

  const getContractConfig = () => {
    return {
      address: contestConfig.address as `0x${string}`,
      abi: contestConfig.abi,
      chainId: contestConfig.chainId,
    };
  };

  async function sendProposal(proposalContent: string): Promise<{ tx: TransactionResponse; proposalId: string }> {
    if (showToast)
      toastLoading({
        message: "proposal is deploying...",
        additionalMessageType: LoadingToastMessageType.KEEP_BROWSER_OPEN,
      });
    setIsLoading(true);
    setIsSuccess(false);
    setError("");
    setTransactionData(null);

    const isEntryTypeVersion = (safeCompareVersions(contestConfig.version, CONTEST_ENTRY_TYPE_VERSION) ?? -1) >= 0;

    return new Promise<{ tx: TransactionResponse; proposalId: string }>(async (resolve, reject) => {
      try {
        const contractConfig = getContractConfig();
        const isVersionBelowMetadataRemoval = !isEntryTypeVersion && compareVersions(contestConfig.version, "6.14") < 0;
        const description = isEntryTypeVersion
          ? metadataFields.length > 0
            ? metadataFields[0].inputValue
            : proposalContent
          : `${generateEntryPreviewHTML(metadataFields)}\n\n${proposalContent}`;
        const proposalCore = {
          author: userAddress,
          exists: true,
          description,
          ...(isVersionBelowMetadataRemoval && {
            targetMetadata: targetMetadata,
            safeMetadata: safeMetadata,
          }),
          ...(!isEntryTypeVersion && { fieldsMetadata: processFieldInputs(metadataFields) }),
        };

        let hash: `0x${string}`;

        const { request } = await simulateContract(getWagmiConfig(), {
          ...contractConfig,
          functionName: "propose",
          args: [proposalCore],
        });
        hash = await writeContract(getWagmiConfig(), request);

        const receipt = await waitForTransactionReceipt(getWagmiConfig(), {
          chainId: contestConfig.chainId,
          hash: hash,
          confirmations: 2,
        });

        const txSendProposal = {
          hash: receipt.transactionHash,
        } as TransactionResponse;

        const proposalId = await getProposalId(proposalCore, contractConfig);

        setTransactionData({
          chainId: contestConfig.chainId,
          hash: receipt.transactionHash,
          transactionHref: `${chain?.blockExplorers?.default?.url}/tx/${hash}`,
        });

        await addUserActionAnalytics({
          address: contestConfig.address,
          userAddress,
          chainName: contestConfig.chainName,
          proposalId,
          proposalName: resolveEntryTitle({
            description,
            fieldsMetadata: metadataFields.length > 0 ? { stringArray: [metadataFields[0].inputValue] } : undefined,
          }),
          charge,
        });

        await fetchSingleProposal(getContractConfig(), contestConfig.version, proposalId);

        setIsLoading(false);
        setIsSuccess(true);
        if (showToast)
          toastSuccess({
            message: "proposal submitted successfully!",
          });
        setSubmissionsCount(submissionsCount + 1);

        if (metadataFields.length > 0) {
          const clearedFields = metadataFields.map(field => ({
            ...field,
            inputValue: "",
          }));
          setMetadataFields(clearedFields);
        }

        resolve({ tx: txSendProposal, proposalId });
      } catch (e) {
        handleError(e, `Something went wrong while submitting your proposal.`);
        setError(errorMessage);
        setIsLoading(false);
      }
    });
  }

  async function addUserActionAnalytics(params: UserAnalyticsParams) {
    try {
      await addUserActionForAnalytics({
        contest_address: params.address,
        user_address: params.userAddress,
        network_name: params.chainName,
        proposal_id: params.proposalId,
        proposal_name: params.proposalName,
        created_at: Math.floor(Date.now() / 1000),
        percentage_to_rewards: params.charge.percentageToRewards,
      });
    } catch (error) {
      console.error("Error in addUserActionForAnalytics:", error);
    }
  }

  return {
    sendProposal,
    isLoading,
    isSuccess,
    error,
  };
}

export default useSubmitProposal;
