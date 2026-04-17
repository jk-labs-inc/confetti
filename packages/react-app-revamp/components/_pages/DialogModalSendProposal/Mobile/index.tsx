import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import Drawer from "@components/UI/Drawer";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { Charge } from "@hooks/useDeployContest/types";
import useMetadataFields from "@hooks/useMetadataFields";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import useSubmitProposal from "@hooks/useSubmitProposal";
import { useModal } from "@getpara/react-sdk-lite";
import { Editor } from "@tiptap/react";
import { type GetBalanceReturnType } from "@wagmi/core";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import DialogModalSendProposalEditor from "../components/Editor";
import DialogModalSendProposalEntryPreviewLayout from "../components/EntryPreviewLayout";
import DialogModalSendProposalMetadataFields from "../components/MetadataFields";
import { isAnyMetadataFieldEmpty, isEntryPreviewPrompt } from "../utils";
import DialogModalSendProposalMobileLayoutConfirm from "./components/ConfirmDialog";

interface DialogModalSendProposalMobileLayoutProps {
  chainName: string;
  contestId: string;
  proposal: string;
  editorProposal: Editor | null;
  charge: Charge;
  accountData: GetBalanceReturnType | undefined;
  isOpen: boolean;
  isConnected: boolean;
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
  charge,
  accountData,
  isOpen,
  isConnected,
  isCorrectNetwork,
  setIsOpen,
  onSwitchNetwork,
  onSubmitProposal,
}) => {
  const { openModal: openWalletModal } = useModal();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { isLoading, isSuccess, error } = useSubmitProposal();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { isLoading: isMetadataFieldsLoading, isError: isMetadataFieldsError } = useMetadataFields({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });
  const { fields: metadataFields } = useMetadataStore(state => state);
  const hasEntryPreview = metadataFields.length > 0 && isEntryPreviewPrompt(metadataFields[0].prompt);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (error || isSuccess) {
      setIsConfirmModalOpen(false);
    }
  }, [error, isSuccess]);

  const handleOpenConfirmModal = () => {
    if (metadataFields.length > 0 && isAnyMetadataFieldEmpty(metadataFields)) {
      setValidationError("please fill in all required fields before submitting.");
      return;
    }

    if (metadataFields.length === 0 && (!proposal.length || editorProposal?.isEmpty)) {
      setValidationError("please fill in your proposal.");
      return;
    }

    setValidationError(null);
    setIsConfirmModalOpen(true);
  };

  return (
    <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-true-black">
      <div className="flex flex-col gap-4 px-6">
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
      <div className="sticky bottom-0 z-10 px-6 pt-4 pb-6 flex flex-col gap-2">
        {!isConnected ? (
          <ButtonV3
            colorClass="bg-gradient-vote rounded-[40px]"
            size={ButtonSize.FULL}
            onClick={() => openWalletModal()}
          >
            connect wallet to enter
          </ButtonV3>
        ) : isCorrectNetwork ? (
          <>
            <ButtonV3
              colorClass="bg-gradient-purple rounded-[40px]"
              size={ButtonSize.FULL}
              onClick={handleOpenConfirmModal}
              isDisabled={isLoading}
            >
              submit
            </ButtonV3>
            {validationError && (
              <p className="text-negative-11 font-bold text-[12px] text-center">{validationError}</p>
            )}
          </>
        ) : (
          <ButtonV3
            colorClass="bg-gradient-create rounded-[40px]"
            size={ButtonSize.FULL}
            onClick={onSwitchNetwork}
          >
            switch network
          </ButtonV3>
        )}
      </div>
      <DialogModalSendProposalMobileLayoutConfirm
        chainName={chainName}
        isOpen={isConfirmModalOpen}
        charge={charge}
        accountData={accountData}
        onConfirm={() => onSubmitProposal?.()}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </Drawer>
  );
};

export default DialogModalSendProposalMobileLayout;
