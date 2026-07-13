import AddFunds from "@components/AddFunds";
import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import UpdatesSignup from "@components/UI/UpdatesSignup";
import { chains } from "@config/wagmi";
import { emailRegex } from "@helpers/regex";
import { Charge } from "@hooks/useDeployContest/types";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { isPhoneNumberEmpty, isValidPhoneNumber } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { type GetBalanceReturnType } from "@wagmi/core";
import { FC, useEffect, useState } from "react";

interface SendProposalMobileLayoutConfirmInitialContentProps {
  charge: Charge;
  accountData: GetBalanceReturnType | undefined;
  chainName: string;
  onConfirm?: () => void;
  onShowAddFunds?: (value: boolean) => void;
}

enum ButtonText {
  SUBMIT = "submit",
  ADD_FUNDS = "add funds to enter",
}

const SendProposalMobileLayoutConfirmInitialContent: FC<SendProposalMobileLayoutConfirmInitialContentProps> = ({
  charge,
  accountData,
  chainName,
  onConfirm,
  onShowAddFunds,
}) => {
  const {
    emailForSubscription,
    setWantsSubscription,
    setEmailForSubscription,
    emailAlreadyExists,
    phoneNumberForSubscription,
    setPhoneNumberForSubscription,
    phoneNumberAlreadyExists,
    setPhoneNumberAlreadyExists,
  } = useSubmitProposalStore(state => state);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const chainCurrencySymbol = chains.find(chain => chain.name.toLowerCase() === chainName)?.nativeCurrency?.symbol;
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [buttonText, setButtonText] = useState(ButtonText.SUBMIT);
  const insufficientBalance = accountData && accountData.value === BigInt(0);

  useEffect(() => {
    setButtonText(insufficientBalance ? ButtonText.ADD_FUNDS : ButtonText.SUBMIT);
  }, [insufficientBalance]);

  const handleEmailChange = (value: string) => {
    setEmailForSubscription(value);
    setWantsSubscription(!!value);
    setEmailError(null);
  };

  const handlePhoneNumberChange = (value: PhoneNumberValue) => {
    setPhoneNumberForSubscription(value);
    setPhoneNumberError(null);
    setPhoneNumberAlreadyExists(false);
  };

  const handleConfirm = () => {
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
    onConfirm?.();
  };

  const handleAddFundsClose = () => {
    setShowAddFunds(false);
    onShowAddFunds?.(false);
  };

  return (
    <>
      {showAddFunds ? (
        <AddFunds chain={chainName} asset={chainCurrencySymbol || ""} onGoBack={handleAddFundsClose} />
      ) : (
        <>
          <UpdatesSignup
            titleVariant="gradient"
            phoneNumber={phoneNumberForSubscription}
            email={emailForSubscription ?? ""}
            phoneNumberError={phoneNumberError}
            emailError={emailError}
            phoneNumberMessage={phoneNumberAlreadyExists ? "your phone number has already been subscribed! :)" : null}
            emailMessage={emailAlreadyExists ? "your email has already been subscribed! :)" : null}
            onPhoneNumberChange={handlePhoneNumberChange}
            onEmailChange={handleEmailChange}
          />

          <div className="flex flex-col gap-2 mt-12">
            <ButtonV3
              colorClass="bg-gradient-vote rounded-[40px]"
              size={ButtonSize.FULL}
              onClick={buttonText === ButtonText.SUBMIT ? handleConfirm : () => setShowAddFunds(true)}
            >
              {buttonText}
            </ButtonV3>
          </div>
        </>
      )}
    </>
  );
};

export default SendProposalMobileLayoutConfirmInitialContent;
