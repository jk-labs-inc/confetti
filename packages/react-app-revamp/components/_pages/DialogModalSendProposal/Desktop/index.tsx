import AddFunds from "@components/AddFunds";
import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import DialogModalV3 from "@components/UI/DialogModalV3";
import EmailSubscription from "@components/UI/EmailSubscription";
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import ContestPrompt from "@components/_pages/Contest/components/Prompt";
import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FOOTER_LINKS } from "@config/links";
import { chains } from "@config/wagmi";
import { emailRegex } from "@helpers/regex";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { Charge } from "@hooks/useDeployContest/types";
import useMetadataFields from "@hooks/useMetadataFields";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import useSubmitProposal from "@hooks/useSubmitProposal";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { Editor } from "@tiptap/react";
import { type GetBalanceReturnType } from "@wagmi/core";
import { FC, ReactNode, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import DialogModalSendProposalEditor from "../components/Editor";
import DialogModalSendProposalEntryPreviewLayout from "../components/EntryPreviewLayout";
import DialogModalSendProposalMetadataFields from "../components/MetadataFields";
import { isEntryPreviewPrompt } from "../utils";

interface DialogModalSendProposalDesktopLayoutProps {
  chainName: string;
  contestId: string;
  proposal: string;
  editorProposal: Editor | null;
  address: string;
  isOpen: boolean;
  isCorrectNetwork: boolean;
  isDragging: boolean;
  charge: Charge;
  accountData: GetBalanceReturnType | undefined;
  setIsOpen: (isOpen: boolean) => void;
  handleDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
  onSwitchNetwork?: () => void;
  onSubmitProposal?: () => void;
}

enum ButtonText {
  SUBMIT = "submit",
  ADD_FUNDS = "add funds",
}

const DialogModalSendProposalDesktopLayout: FC<DialogModalSendProposalDesktopLayoutProps> = ({
  chainName,
  contestId,
  proposal,
  editorProposal,
  address,
  isOpen,
  isCorrectNetwork,
  charge,
  accountData,
  isDragging,
  setIsOpen,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  onSwitchNetwork,
  onSubmitProposal,
}) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { contestPrompt } = useContestStore(state => state);
  const {
    setWantsSubscription,
    setEmailForSubscription,
    emailForSubscription,
    emailAlreadyExists,
    setEmailAlreadyExists,
  } = useSubmitProposalStore(state => state);
  const { isLoading } = useSubmitProposal();
  const [emailError, setEmailError] = useState<string | null>(null);
  const tosHref = FOOTER_LINKS.find(link => link.label === "Terms")?.href;
  const { isLoading: isMetadataFieldsLoading, isError: isMetadataFieldsError } = useMetadataFields({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });
  const { fields: metadataFields } = useMetadataStore(state => state);
  const [error, setError] = useState<ReactNode | null>(null);
  const chainCurrencySymbol = chains.find(chain => chain.name.toLowerCase() === chainName)?.nativeCurrency?.symbol;
  const hasEntryPreview = metadataFields.length > 0 && isEntryPreviewPrompt(metadataFields[0].prompt);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const insufficientBalance = accountData && accountData.value === BigInt(0);
  const [buttonText, setButtonText] = useState(ButtonText.SUBMIT);

  useEffect(() => {
    setButtonText(insufficientBalance ? ButtonText.ADD_FUNDS : ButtonText.SUBMIT);
  }, [insufficientBalance]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmailForSubscription(value);
    setWantsSubscription(!!value);
    setEmailError(null);
    setEmailAlreadyExists(false);
  };

  const handleConfirm = () => {
    setError(null);

    if (metadataFields.length > 0) {
      if (isAnyMetadataFieldEmpty()) {
        setError(
          <p className="text-negative-11 font-bold text-[12px]">
            Please fill in all required fields before submitting.
          </p>,
        );
        return;
      }
    } else {
      if (!proposal.length || editorProposal?.isEmpty) {
        setError(<p className="text-negative-11 font-bold text-[12px]">Please fill in your proposal.</p>);
        return;
      }
    }

    if (emailForSubscription && !emailRegex.test(emailForSubscription)) {
      setEmailError("Invalid email address.");
      return;
    }

    setEmailError(null);
    onSubmitProposal?.();
  };

  const isAnyMetadataFieldEmpty = () => {
    if (metadataFields.length === 0) return false;
    return metadataFields.some(field => field.inputValue === "");
  };

  const onCloseModal = () => {
    setIsOpen(false);
    setShowAddFundsModal(false);
  };

  return (
    <DialogModalV3 title="submission" isOpen={isOpen} setIsOpen={onCloseModal} className="w-full xl:w-[1100px]">
      <div className="flex flex-col gap-4 md:pl-[50px] lg:pl-[100px] mt-[60px] mb-[60px]">
        {showAddFundsModal ? (
          <AddFunds
            className="md:w-[400px]"
            chain={chainName}
            asset={chainCurrencySymbol ?? ""}
            onGoBack={() => setShowAddFundsModal(false)}
          />
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <ContestPrompt type="modal" prompt={contestPrompt} hidePrompt />
              <div className="flex flex-col gap-2">
                <UserProfileDisplay ethereumAddress={address ?? ""} shortenOnFallback={true} />
              </div>
            </div>
            <div className="flex flex-col gap-8 rounded-md md:w-[650px]">
              {hasEntryPreview ? (
                <DialogModalSendProposalEntryPreviewLayout
                  entryPreviewLayout={metadataFields[0].prompt}
                  editorProposal={editorProposal}
                  isDragging={isDragging}
                  handleDrop={handleDrop}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                />
              ) : (
                <DialogModalSendProposalEditor
                  editorProposal={editorProposal}
                  handleDrop={handleDrop}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  isDragging={isDragging}
                />
              )}

              {isMetadataFieldsLoading ? (
                <p className="loadingDots font-sabo-filled text-[16px] text-neutral-14">loading metadata fields</p>
              ) : isMetadataFieldsError ? (
                <p className="text-negative-11">Error while loading metadata fields. Please reload the page.</p>
              ) : metadataFields.length > 0 ? (
                <DialogModalSendProposalMetadataFields />
              ) : null}
              <div className="flex flex-col gap-4 -mt-2">
                <CreateGradientTitle textSize="small" additionalInfo="optional">
                  get updates by email
                </CreateGradientTitle>
                <EmailSubscription
                  emailAlreadyExists={emailAlreadyExists ?? false}
                  emailError={emailError}
                  emailForSubscription={emailForSubscription ?? ""}
                  tosHref={tosHref ?? ""}
                  handleEmailChange={handleEmailChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-12 mt-12">
              {isCorrectNetwork ? (
                <div className="flex flex-col gap-2">
                  <ButtonV3
                    colorClass="bg-gradient-purple rounded-[40px]"
                    size={ButtonSize.EXTRA_LARGE_LONG}
                    onClick={buttonText === ButtonText.SUBMIT ? handleConfirm : () => setShowAddFundsModal(true)}
                    isDisabled={isLoading}
                  >
                    {buttonText}
                  </ButtonV3>
                  {error && <>{error}</>}
                </div>
              ) : (
                <ButtonV3
                  colorClass="bg-gradient-create rounded-[40px]"
                  size={ButtonSize.EXTRA_LARGE_LONG}
                  onClick={onSwitchNetwork}
                >
                  switch network
                </ButtonV3>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogModalV3>
  );
};

export default DialogModalSendProposalDesktopLayout;
