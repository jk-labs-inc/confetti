import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { FC } from "react";

interface StickyVoteFooterProps {
  totalProposals: number;
  setShowVotingModal: (show: boolean) => void;
}

const StickyVoteFooter: FC<StickyVoteFooterProps> = ({ totalProposals, setShowVotingModal }) => {
  return (
    <div className={`fixed ${totalProposals > 1 ? "bottom-[106px]" : "bottom-14"} left-0 right-0 bg-transparent pb-8`}>
      <div className="mx-auto flex justify-center px-8 max-w-md w-full">
        <ButtonV3
          onClick={() => setShowVotingModal(true)}
          colorClass="bg-gradient-purple"
          textColorClass="text-true-black rounded-[40px]"
          size={ButtonSize.FULL}
        >
          add votes
        </ButtonV3>
      </div>
    </div>
  );
};

export default StickyVoteFooter;
