import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useSubmitQualification } from "@hooks/useUserSubmitQualification";
import { useWallet } from "@hooks/useWallet";
import { useModal } from "@getpara/react-sdk-lite";
import { useShallow } from "zustand/shallow";

export type SubmitBarVariant =
  | { kind: "counter-submit"; onClick: () => void }
  | { kind: "connect"; onClick: () => void }
  | { kind: "creator-only-message" }
  | { kind: "hidden" };

interface UseContestSubmitButtonProps {
  onOpenModal: () => void;
}

export const useContestSubmitButton = ({ onOpenModal }: UseContestSubmitButtonProps) => {
  const { isConnected, userAddress } = useWallet();
  const { openModal } = useModal();
  const { contestConfig } = useContestConfigStore(state => state);
  const { qualifies, anyoneCanSubmit, isLoading } = useSubmitQualification({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    userAddress: userAddress as `0x${string}` | undefined,
  });

  const { setIsSuccess: setIsSubmitProposalSuccess } = useSubmitProposalStore(
    useShallow(state => ({
      setIsSuccess: state.setIsSuccess,
    })),
  );
  const contestState = useContestStateStore(useShallow(state => state.contestState));

  const isContestCanceled = contestState === ContestStateEnum.Canceled;

  const handleEnterContest = () => {
    setIsSubmitProposalSuccess(false);
    onOpenModal();
  };

  const resolveVariant = (): SubmitBarVariant => {
    if (isContestCanceled) return { kind: "hidden" };
    if (isLoading) return { kind: "hidden" };

    if (anyoneCanSubmit) {
      return { kind: "counter-submit", onClick: handleEnterContest };
    }

    if (!isConnected) {
      return { kind: "connect", onClick: () => openModal() };
    }

    if (qualifies) {
      return { kind: "counter-submit", onClick: handleEnterContest };
    }

    return { kind: "creator-only-message" };
  };

  return { variant: resolveVariant() };
};
