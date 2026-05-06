import { Proposal } from "@components/_pages/ProposalContent";
import { FC } from "react";

interface ProposalContentVotePrimaryProps {
  proposal: Proposal;
  handleVotingModalOpen?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "default" | "large";
}

const SIZE_CLASSES = {
  default: "w-12 md:w-20 h-8 rounded-[16px]",
  large: "w-24 md:w-20 h-8 rounded-[16px]",
} as const;

const ProposalContentVotePrimary: FC<ProposalContentVotePrimaryProps> = ({
  proposal,
  handleVotingModalOpen,
  size = "default",
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleVotingModalOpen?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`group shrink-0 ${SIZE_CLASSES[size]} p-2 flex items-center justify-center bg-gradient-vote hover:shadow-button-embossed-hover transition-all duration-200 cursor-pointer text-true-black`}
    >
      <img src="/contest/upvote-2.svg" width={18} height={20} alt="upvote" className="shrink-0" />
    </button>
  );
};

export default ProposalContentVotePrimary;
