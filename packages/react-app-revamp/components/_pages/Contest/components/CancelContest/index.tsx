import { extractPathSegments } from "@helpers/extractPath";
import { getChainId } from "@helpers/getChainId";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useContestStore } from "@hooks/useContest/store";
import { useContestState } from "@hooks/useContestState";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import useTotalVotesCastOnContest from "@hooks/useTotalVotesCastOnContest";
import { useWallet } from "@hooks/useWallet";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import { useShallow } from "zustand/shallow";
import { META_LINK_ICON_CLASS_NAME } from "../ContestName/constants";
import CancelContestModal from "./components/Modal";

interface CancelContestProps {
  variant?: "icon" | "link";
}

const CancelContest: FC<CancelContestProps> = ({ variant = "icon" }) => {
  const pathname = usePathname();
  const { address: contestAddress, chainName } = extractPathSegments(pathname);
  const contestChainId = getChainId(chainName);
  const {
    userAddress,
    chain: { id: chainId },
    changeNetworks,
  } = useWallet();
  const contestAuthorEthereumAddress = useContestStore(useShallow(state => state.contestAuthorEthereumAddress));
  const { cancelContest, isLoading, isConfirmed } = useContestState();
  const { contestState } = useContestStateStore(state => state);
  const {
    totalVotesCast,
    isLoading: isLoadingTotalVotesCast,
    isError: isErrorTotalVotesCast,
  } = useTotalVotesCastOnContest(contestAddress, contestChainId);
  const [isCloseContestModalOpen, setIsCloseContestModalOpen] = useState(false);

  if (userAddress !== contestAuthorEthereumAddress) return null;
  if (contestState === ContestStateEnum.Canceled) return null;
  if (isConfirmed && !isLoading) return null;

  if (totalVotesCast && Number(totalVotesCast) > 0 && !isLoadingTotalVotesCast && !isErrorTotalVotesCast) {
    return null;
  }

  const handleOpenModal = () => setIsCloseContestModalOpen(true);

  const handleCancelContest = async () => {
    if (!contestChainId) return;

    if (contestChainId !== chainId) {
      changeNetworks(contestChainId);
    }

    cancelContest();
    setIsCloseContestModalOpen(false);
  };

  return (
    <>
      {variant === "link" ? (
        <button
          disabled={isLoading}
          onClick={handleOpenModal}
          className="flex shrink-0 items-center gap-1.5 text-negative-11 hover:text-negative-10 transition-colors duration-150"
        >
          <TrashIcon className={META_LINK_ICON_CLASS_NAME} strokeWidth={2} />
          cancel
        </button>
      ) : (
        <button disabled={isLoading} onClick={handleOpenModal}>
          <TrashIcon className="w-6 h-6 text-negative-11 hover:text-negative-10 transition-colors duration-300 ease-in-out" />
        </button>
      )}

      <CancelContestModal
        isCloseContestModalOpen={isCloseContestModalOpen}
        setIsCloseContestModalOpen={setIsCloseContestModalOpen}
        cancelContestHandler={handleCancelContest}
      />
    </>
  );
};

export default CancelContest;
