import { useContestSubmitButton } from "@components/_pages/Contest/Contest/useContestSubmitButton";
import DialogModalSendProposal from "@components/_pages/DialogModalSendProposal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { FC, useState } from "react";

const PreVoteSubmit: FC = () => {
  const [isSubmitProposalModalOpen, setIsSubmitProposalModalOpen] = useState(false);
  const { variant } = useContestSubmitButton({ onOpenModal: () => setIsSubmitProposalModalOpen(true) });

  if (variant.kind === "hidden") return null;
  if (variant.kind === "creator-only-message") {
    return <p className="text-[14px] text-neutral-9">only the contest creator can submit entries</p>;
  }

  return (
    <>
      <button
        type="button"
        onClick={variant.onClick}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-neutral-10 px-[18px] text-[15px] font-bold text-neutral-11 transition-colors duration-150 hover:border-neutral-11 hover:bg-neutral-2"
      >
        {variant.kind === "connect" ? (
          "sign in to submit"
        ) : (
          <>
            <PlusIcon aria-hidden="true" strokeWidth={2.6} className="h-3.5 w-3.5" />
            submit entry
          </>
        )}
      </button>
      <DialogModalSendProposal isOpen={isSubmitProposalModalOpen} setIsOpen={setIsSubmitProposalModalOpen} />
    </>
  );
};

export default PreVoteSubmit;
