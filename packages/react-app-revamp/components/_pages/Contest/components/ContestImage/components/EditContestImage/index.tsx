import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import useEditContestPrompt from "@hooks/useEditContestPrompt";
import { useWallet } from "@hooks/useWallet";
import { switchChain } from "@wagmi/core";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { FC, useState } from "react";
import { useShallow } from "zustand/shallow";
import { parsePrompt } from "../../../Prompt/utils";
import EditContestImageModal from "./components/Modal";

interface EditContestImageProps {
  contestPrompt: string;
  canEditTitle: boolean;
}

const EditContestImage: FC<EditContestImageProps> = ({ contestPrompt, canEditTitle }) => {
  const {
    userAddress,
    chain: { name: accountChain },
  } = useWallet();
  const { contestSummary, contestEvaluate, contestContactDetails, contestImageUrl } = parsePrompt(contestPrompt);
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const isOnCorrectChain = accountChain?.toLowerCase() === contestConfig.chainName.toLowerCase();
  const { contestAuthorEthereumAddress } = useContestStore(state => state);
  const isAuthor = userAddress === contestAuthorEthereumAddress;
  const { contestState } = useContestStateStore(state => state);
  const isCompletedOrCanceled =
    contestState === ContestStateEnum.Completed || contestState === ContestStateEnum.Canceled;
  const shouldRender = canEditTitle && !isCompletedOrCanceled && isAuthor;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { editPrompt } = useEditContestPrompt({
    contestAbi: contestConfig.abi,
    contestAddress: contestConfig.address,
  });

  if (!shouldRender) return null;

  const handleSave = async (newImageUrl: string) => {
    if (!contestConfig.chainId) return;
    if (newImageUrl === contestImageUrl) return;

    if (!isOnCorrectChain) {
      await switchChain(getWagmiConfig(), { chainId: contestConfig.chainId });
    }

    const formattedPrompt = new URLSearchParams({
      imageUrl: newImageUrl,
      summarize: contestSummary,
      evaluateVoters: contestEvaluate,
      contactDetails: contestContactDetails,
    }).toString();

    await editPrompt(formattedPrompt);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        <PencilSquareIcon className="w-6 h-6 text-neutral-11 hover:text-neutral-10 transition-colors duration-300 ease-in-out" />
      </button>

      <EditContestImageModal
        contestImageUrl={contestImageUrl ?? ""}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default EditContestImage;
