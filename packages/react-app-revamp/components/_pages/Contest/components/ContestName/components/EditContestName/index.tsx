import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import useEditContestTitle from "@hooks/useEditContestTitle";
import useEditContestPrompt from "@hooks/useEditContestPrompt";
import { parsePrompt } from "../../../Prompt/utils";
import { switchChain } from "@wagmi/core";
import { FC, useState } from "react";
import { useWallet } from "@hooks/useWallet";
import { useShallow } from "zustand/shallow";
import EditContestNameModal from "./components/Modal";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";

interface EditContestNameProps {
  contestName: string;
  canEditTitle: boolean;
  contestPrompt?: string;
  contestImageUrl?: string;
}

const EditContestName: FC<EditContestNameProps> = ({ contestName, canEditTitle, contestPrompt, contestImageUrl }) => {
  const {
    userAddress,
    chain: { name: accountChain },
  } = useWallet();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const isOnCorrectChain = accountChain?.toLowerCase() === contestConfig.chainName.toLowerCase();
  const { contestAuthorEthereumAddress } = useContestStore(state => state);
  const isAuthor = userAddress === contestAuthorEthereumAddress;
  const { contestState } = useContestStateStore(state => state);
  const isCompletedOrCanceled =
    contestState === ContestStateEnum.Completed || contestState === ContestStateEnum.Canceled;
  const shouldRender = canEditTitle && !isCompletedOrCanceled && isAuthor;
  const [isEditContestNameModalOpen, setIsEditContestNameModalOpen] = useState(false);
  const { editTitle } = useEditContestTitle({
    contestAbi: contestConfig.abi,
    contestAddress: contestConfig.address,
  });
  const { editPrompt } = useEditContestPrompt({
    contestAbi: contestConfig.abi,
    contestAddress: contestConfig.address,
  });
  const showImageUpload = !contestImageUrl;

  if (!shouldRender) return null;

  const handleOpenModal = () => setIsEditContestNameModalOpen(true);

  const handleEditContestName = async (value: string) => {
    if (!contestConfig.chainId) return;
    if (value === contestName) return;

    if (!isOnCorrectChain) {
      await switchChain(getWagmiConfig(), { chainId: contestConfig.chainId });
    }

    await editTitle(value);
  };

  const handleImageSave = async (newImageUrl: string) => {
    if (!contestConfig.chainId || !contestPrompt) return;

    if (!isOnCorrectChain) {
      await switchChain(getWagmiConfig(), { chainId: contestConfig.chainId });
    }

    const { contestSummary, contestEvaluate, contestContactDetails } = parsePrompt(contestPrompt);

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
      <button onClick={handleOpenModal}>
        <PencilSquareIcon className="w-6 h-6 text-neutral-11 hover:text-neutral-10 transition-colors duration-300 ease-in-out" />
      </button>

      <EditContestNameModal
        contestName={contestName}
        isOpen={isEditContestNameModalOpen}
        setIsCloseModal={setIsEditContestNameModalOpen}
        handleEditContestName={handleEditContestName}
        showImageUpload={showImageUpload}
        onImageSave={handleImageSave}
      />
    </>
  );
};

export default EditContestName;
