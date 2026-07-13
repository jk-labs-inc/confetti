import AddFunds from "@components/AddFunds";
import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import DialogModalV3 from "@components/UI/DialogModalV3";
import UpdatesSignup from "@components/UI/UpdatesSignup";
import ContestPrompt from "@components/_pages/Contest/components/Prompt";
import { chains } from "@config/wagmi";
import { emailRegex } from "@helpers/regex";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { Charge } from "@hooks/useDeployContest/types";
import useContestEntryType from "@hooks/useContestEntryType";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import useSubmitProposal from "@hooks/useSubmitProposal";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useModal } from "@getpara/react-sdk-lite";
import { isPhoneNumberEmpty, isValidPhoneNumber } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { Editor } from "@tiptap/react";
import { type GetBalanceReturnType } from "@wagmi/core";
import { FC, ReactNode, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import DialogModalSendProposalEditor from "../components/Editor";
import DialogModalSendProposalEntryPreviewLayout from "../components/EntryPreviewLayout";
import { isAnyMetadataFieldEmpty, isEntryPreviewPrompt } from "../utils";

interface DialogModalSendProposalDesktopLayoutProps {
  chainName: string;
  contestId: string;
  proposal: string;
  editorProposal: Editor | null;
  isOpen: boolean;
  isConnected: boolean;
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
  ADD_FUNDS = "add funds to enter",
}

const DialogModalSendProposalDesktopLayout: FC<DialogModalSendProposalDesktopLayoutProps> = ({
  chainName,
  contestId,
  proposal,
  editorProposal,
  isOpen,
  isConnected,
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
  const { openModal: openWalletModal } = useModal();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { contestPrompt } = useContestStore(state => state);
  const {
    setWantsSubscription,
    setEmailForSubscription,
    emailForSubscription,
    emailAlreadyExists,
    setEmailAlreadyExists,
    phoneNumberForSubscription,
    setPhoneNumberForSubscription,
    phoneNumberAlreadyExists,
    setPhoneNumberAlreadyExists,
  } = useSubmitProposalStore(state => state);
  const { isLoading } = useSubmitProposal();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const { isLoading: isEntryTypeLoading, isError: isEntryTypeError } = useContestEntryType({
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

  const handleEmailChange = (value: string) => {
    setEmailForSubscription(value);
    setWantsSubscription(!!value);
    setEmailError(null);
    setEmailAlreadyExists(false);
  };

  const handlePhoneNumberChange = (value: PhoneNumberValue) => {
    setPhoneNumberForSubscription(value);
    setPhoneNumberError(null);
    setPhoneNumberAlreadyExists(false);
  };

  const handleConfirm = () => {
    setError(null);

    if (metadataFields.length > 0) {
      if (isAnyMetadataFieldEmpty(metadataFields)) {
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

    if (!isPhoneNumberEmpty(phoneNumberForSubscription) && !isValidPhoneNumber(phoneNumberForSubscription)) {
      setPhoneNumberError("Invalid phone number.");
      return;
    }

    if (emailForSubscription && !emailRegex.test(emailForSubscription)) {
      setEmailError("Invalid email address.");
      return;
    }

    setPhoneNumberError(null);
    setEmailError(null);
    onSubmitProposal?.();
  };

  const onCloseModal = () => {
    setIsOpen(false);
    setShowAddFundsModal(false);
  };

  return (
    <DialogModalV3 title="submission" isOpen={isOpen} setIsOpen={onCloseModal} disableFocusTrap className="w-full xl:w-[1100px]">
      <div className="flex flex-col gap-4 md:pl-[50px] lg:pl-[100px] mt-[36px] mb-[36px]">
        {showAddFundsModal ? (
          <AddFunds
            className="md:w-[400px]"
            chain={chainName}
            asset={chainCurrencySymbol ?? ""}
            onGoBack={() => setShowAddFundsModal(false)}
          />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <ContestPrompt type="modal" prompt={contestPrompt} hidePrompt />
              </div>
              <div className="flex flex-col gap-5 rounded-md md:w-[650px]">
                {hasEntryPreview ? (
                  <DialogModalSendProposalEntryPreviewLayout entryPreviewLayout={metadataFields[0].prompt} />
                ) : (
                  <DialogModalSendProposalEditor
                    editorProposal={editorProposal}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    isDragging={isDragging}
                  />
                )}

                {isEntryTypeLoading ? (
                  <p className="loadingDots font-sabo-filled text-[16px] text-neutral-14">loading entry format</p>
                ) : isEntryTypeError ? (
                  <p className="text-negative-11">Error while loading entry format. Please reload the page.</p>
                ) : null}
                <UpdatesSignup
                  className="-mt-2 md:w-[328px]"
                  titleVariant="gradient"
                  phoneNumber={phoneNumberForSubscription}
                  email={emailForSubscription ?? ""}
                  phoneNumberError={phoneNumberError}
                  emailError={emailError}
                  phoneNumberMessage={
                    phoneNumberAlreadyExists ? "your phone number has already been subscribed! :)" : null
                  }
                  emailMessage={emailAlreadyExists ? "your email has already been subscribed! :)" : null}
                  onPhoneNumberChange={handlePhoneNumberChange}
                  onEmailChange={handleEmailChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 mt-6">
              {!isConnected ? (
                <ButtonV3
                  colorClass="bg-gradient-vote rounded-[40px]"
                  size={ButtonSize.EXTRA_LARGE_LONG}
                  onClick={() => openWalletModal()}
                >
                  sign in to enter
                </ButtonV3>
              ) : isCorrectNetwork ? (
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
