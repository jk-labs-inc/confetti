import { Proposal } from "@components/_pages/ProposalContent";
import { FC } from "react";

interface ProposalContentVotePrimaryProps {
  proposal: Proposal;
  handleVotingModalOpen?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProposalContentVotePrimary: FC<ProposalContentVotePrimaryProps> = ({ proposal, handleVotingModalOpen }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleVotingModalOpen?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className="group shrink-0 w-12 md:w-20 h-8 p-2 flex items-center justify-center bg-gradient-vote hover:shadow-button-embossed-hover transition-all duration-200 rounded-[16px] cursor-pointer text-true-black"
    >
      <img src="/contest/upvote-2.svg" width={18} height={20} alt="upvote" className="shrink-0" />
    </button>
  );
};

export default ProposalContentVotePrimary;
