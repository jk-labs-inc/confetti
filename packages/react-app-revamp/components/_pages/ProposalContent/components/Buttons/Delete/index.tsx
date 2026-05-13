import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface ProposalContentDeleteButtonProps {
  proposalId: string;
  selectedProposalIds: string[];
  toggleProposalSelection?: (proposalId: string) => void;
  inline?: boolean;
}

const ProposalContentDeleteButton: FC<ProposalContentDeleteButtonProps> = ({
  proposalId,
  selectedProposalIds,
  toggleProposalSelection,
  inline = false,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    toggleProposalSelection?.(proposalId);
  };

  const positioningClasses = inline ? "" : "ml-[5px] md:-ml-12 mt-1";

  return (
    <div className={`${positioningClasses} h-6 w-6 relative cursor-pointer`} onClick={handleClick}>
      <CheckIcon
        className={`absolute top-0 left-0 transform transition-all ease-in-out duration-300 
              ${selectedProposalIds.includes(proposalId) ? "opacity-100" : "opacity-0"}
              h-4 w-4 md:h-6 md:w-6 text-positive-11 bg-true-black border border-positive-11 hover:text-positive-10
              shadow-md hover:shadow-lg rounded-md`}
      />
      <TrashIcon
        className={`absolute top-0 left-0 transition-opacity duration-300 
              ${selectedProposalIds.includes(proposalId) ? "opacity-0" : "opacity-100"}
              h-4 w-4 md:h-6 md:w-6 text-negative-11 bg-true-black hover:text-negative-10 transition-colors duration-300 ease-in-out`}
      />
    </div>
  );
};

export default ProposalContentDeleteButton;
