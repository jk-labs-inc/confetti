import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useSubmitQualification } from "@hooks/useUserSubmitQualification";
import { useWallet } from "@hooks/useWallet";
import { useModal } from "@getpara/react-sdk-lite";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

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
    enabled: isConnected,
  });

  const { setIsSuccess: setIsSubmitProposalSuccess } = useSubmitProposalStore(
    useShallow(state => ({
      setIsSuccess: state.setIsSuccess,
    })),
  );
  const contestState = useContestStateStore(useShallow(state => state.contestState));
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const isContestCanceled = contestState === ContestStateEnum.Canceled;

  const handleEnterContest = () => {
    setIsSubmitProposalSuccess(false);
    onOpenModal();
  };

  const renderSubmitButton = () => {
    if (isContestCanceled) return null;

    if (!isConnected) {
      return (
        <ButtonV3
          colorClass="bg-gradient-vote rounded-[40px]"
          size={isMobile ? ButtonSize.EXTRA_LARGE_LONG_MOBILE : ButtonSize.EXTRA_LARGE_LONG}
          onClick={() => openModal()}
        >
          connect wallet to submit entry
        </ButtonV3>
      );
    }

    if (isLoading) return null;

    if (qualifies) {
      return (
        <ButtonV3
          colorClass="bg-gradient-purple rounded-[40px]"
          textColorClass="text-[16px] md:text-[20px] font-bold text-true-black"
          size={isMobile ? ButtonSize.EXTRA_LARGE_LONG_MOBILE : ButtonSize.EXTRA_LARGE_LONG}
          onClick={handleEnterContest}
        >
          submit entry
        </ButtonV3>
      );
    }

    if (!anyoneCanSubmit) {
      return <p className="text-secondary-11 text-[16px]">only the contest creator can submit entries</p>;
    }

    return null;
  };

  return { renderSubmitButton };
};
