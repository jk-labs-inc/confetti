import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

interface UseContestSubmitButtonProps {
  onOpenModal: () => void;
}

export const useContestSubmitButton = ({ onOpenModal }: UseContestSubmitButtonProps) => {
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
  };

  return { renderSubmitButton };
};
