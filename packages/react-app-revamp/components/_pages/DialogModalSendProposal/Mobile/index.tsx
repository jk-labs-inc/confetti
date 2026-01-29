import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import DialogModalV3 from "@components/UI/DialogModalV3";
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import ContestPrompt from "@components/_pages/Contest/components/Prompt";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { Charge } from "@hooks/useDeployContest/types";
import useMetadataFields from "@hooks/useMetadataFields";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import useSubmitProposal from "@hooks/useSubmitProposal";
import { Editor } from "@tiptap/react";
import { type GetBalanceReturnType } from "@wagmi/core";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import DialogModalSendProposalEditor from "../components/Editor";
import DialogModalSendProposalEntryPreviewLayout from "../components/EntryPreviewLayout";
import DialogModalSendProposalMetadataFields from "../components/MetadataFields";
import { isEntryPreviewPrompt } from "../utils";
import DialogModalSendProposalMobileLayoutConfirm from "./components/ConfirmDialog";

interface DialogModalSendProposalMobileLayoutProps {
  chainName: string;
  contestId: string;
  proposal: string;
  editorProposal: Editor | null;
  charge: Charge;
  accountData: GetBalanceReturnType | undefined;
  address: string;
  isOpen: boolean;
  isCorrectNetwork: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSwitchNetwork?: () => void;
  onSubmitProposal?: () => void;
}

const DialogModalSendProposalMobileLayout: FC<DialogModalSendProposalMobileLayoutProps> = ({
  chainName,
  contestId,
  proposal,
  editorProposal,
  address,
  charge,
  accountData,
  isOpen,
  isCorrectNetwork,
  setIsOpen,
  onSwitchNetwork,
  onSubmitProposal,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { isLoading, isSuccess, error } = useSubmitProposal();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { contestPrompt } = useContestStore(state => state);
  const isInPwaMode = window.matchMedia("(display-mode: standalone)").matches;
  const { isLoading: isMetadataFieldsLoading, isError: isMetadataFieldsError } = useMetadataFields({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });
  const { fields: metadataFields } = useMetadataStore(state => state);
  const hasEntryPreview = metadataFields.length > 0 && isEntryPreviewPrompt(metadataFields[0].prompt);

  useEffect(() => {
    if (error || isSuccess) {
      setIsConfirmModalOpen(false);
    }
  }, [error, isSuccess]);

  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const isAnyMetadataFieldEmpty = () => {
    if (metadataFields.length === 0) return false;
    return metadataFields.some(field => field.inputValue === "");
  };

  const isSubmitButtonDisabled = () => {
    if (metadataFields.length > 0) {
      return isAnyMetadataFieldEmpty();
    } else {
      return !proposal.length || editorProposal?.isEmpty;
    }
  };

  return (
    <DialogModalV3 isOpen={isOpen} title="sendProposalMobile" isMobile>
      <div
        className={`${
          isConfirmModalOpen ? "fixed" : "hidden"
        } inset-0 z-50 pointer-events-none bg-neutral-8 bg-neutral-8/60`}
        aria-hidden="true"
      />
      <div
        className={`flex flex-col gap-8 ${isInPwaMode ? "mt-0" : "mt-12"} ${
          isConfirmModalOpen ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <p className="text-neutral-11 text-[16px] font-bold" onClick={() => setIsOpen(false)}>
            cancel
          </p>
          {isCorrectNetwork ? (
            <ButtonV3
              colorClass="bg-gradient-purple rounded-[40px]"
              size={ButtonSize.DEFAULT_LONG}
              onClick={handleOpenConfirmModal}
              isDisabled={isLoading || isSubmitButtonDisabled()}
            >
              submit
            </ButtonV3>
          ) : (
            <ButtonV3
              colorClass="bg-gradient-create rounded-[40px]"
              size={ButtonSize.DEFAULT}
              onClick={onSwitchNetwork}
            >
              switch network
            </ButtonV3>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <ContestPrompt type="modal" prompt={contestPrompt} hidePrompt />
            <div className="flex flex-col gap-2">
              <UserProfileDisplay ethereumAddress={address ?? ""} shortenOnFallback={true} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {hasEntryPreview ? (
              <DialogModalSendProposalEntryPreviewLayout
                entryPreviewLayout={metadataFields[0].prompt}
                editorProposal={editorProposal}
              />
            ) : (
              <DialogModalSendProposalEditor editorProposal={editorProposal} />
            )}

            <div className="flex flex-col gap-8">
              {isMetadataFieldsLoading ? (
                <p className="loadingDots font-sabo-filled text-[16px] text-neutral-14">loading metadata fields</p>
              ) : isMetadataFieldsError ? (
                <p className="text-negative-11">Error while loading metadata fields. Please reload the page.</p>
              ) : metadataFields.length > 0 ? (
                <DialogModalSendProposalMetadataFields />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div>
        <DialogModalSendProposalMobileLayoutConfirm
          chainName={chainName}
          isOpen={isConfirmModalOpen}
          charge={charge}
          accountData={accountData}
          onConfirm={() => onSubmitProposal?.()}
          onClose={() => setIsConfirmModalOpen(false)}
        />
      </div>
    </DialogModalV3>
  );
};

export default DialogModalSendProposalMobileLayout;
