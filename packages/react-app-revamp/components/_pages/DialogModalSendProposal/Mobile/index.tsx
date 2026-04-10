import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import Drawer from "@components/UI/Drawer";
import ContestPrompt from "@components/_pages/Contest/components/Prompt";
import shortenEthereumAddress from "@helpers/shortenEthereumAddress";
import { useContestStore } from "@hooks/useContest/store";
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
import { isEntryPreviewPrompt } from "../utils";
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
  qualifies: boolean;
  anyoneCanSubmit: boolean;
  creator: string | undefined;
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
  qualifies,
  anyoneCanSubmit,
  creator,
  setIsOpen,
  onSwitchNetwork,
  onSubmitProposal,
}) => {
  const { openModal: openWalletModal } = useModal();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { isLoading, isSuccess, error } = useSubmitProposal();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { contestPrompt } = useContestStore(state => state);
  const { isLoading: isMetadataFieldsLoading, isError: isMetadataFieldsError } = useMetadataFields({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });
  const { fields: metadataFields } = useMetadataStore(state => state);
  const hasEntryPreview = metadataFields.length > 0 && isEntryPreviewPrompt(metadataFields[0].prompt);
  const isDisqualified = isConnected && !qualifies && !anyoneCanSubmit;

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
    <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-true-black">
      <div className="flex flex-col gap-6 px-6 pb-6">
        {!anyoneCanSubmit && creator && !qualifies && (
          <div className="bg-gradient-create rounded-[10px] p-[1px]">
            <div className="flex items-center gap-3 rounded-[10px] bg-true-black py-3 px-4">
              <p className="text-[14px] text-neutral-11">
                {isConnected
                  ? `only the contest creator (${shortenEthereumAddress(creator)}) can submit entries`
                  : `if you are not the contest creator (${shortenEthereumAddress(creator)}) you will not be able to submit an entry`}
              </p>
            </div>
          </div>
        )}
        <div className={`flex flex-col gap-4 transition-opacity duration-300 ${
          isDisqualified ? "opacity-30 pointer-events-none select-none" : ""
        }`}>
          <ContestPrompt type="modal" prompt={contestPrompt} hidePrompt />
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
        {!isDisqualified && (
          <div className="flex flex-col gap-4">
            {!isConnected ? (
              <ButtonV3
                colorClass="bg-gradient-vote rounded-[40px]"
                size={ButtonSize.EXTRA_LARGE_LONG_MOBILE}
                onClick={() => openWalletModal()}
              >
                connect wallet to submit entry
              </ButtonV3>
            ) : isCorrectNetwork ? (
              <ButtonV3
                colorClass="bg-gradient-purple rounded-[40px]"
                size={ButtonSize.EXTRA_LARGE_LONG_MOBILE}
                onClick={handleOpenConfirmModal}
                isDisabled={isLoading || isSubmitButtonDisabled()}
              >
                submit
              </ButtonV3>
            ) : (
              <ButtonV3
                colorClass="bg-gradient-create rounded-[40px]"
                size={ButtonSize.EXTRA_LARGE_LONG_MOBILE}
                onClick={onSwitchNetwork}
              >
                switch network
              </ButtonV3>
            )}
          </div>
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
