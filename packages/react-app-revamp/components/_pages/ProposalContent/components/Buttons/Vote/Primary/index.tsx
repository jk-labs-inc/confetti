import { Proposal } from "@components/_pages/ProposalContent";
import { formatNumberAbbreviated } from "@helpers/formatNumber";
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
      className="group shrink-0 w-16 h-6 p-2 flex items-center justify-center bg-gradient-vote hover:shadow-button-embossed-hover transition-all duration-200 rounded-[16px] cursor-pointer text-true-black"
    >
      <img src="/contest/upvote-2.svg" width={13} height={15} alt="upvote" className="shrink-0" />
    </button>
  );
};

export default ProposalContentVotePrimary;
