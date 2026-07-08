import AddFunds from "@components/AddFunds";
import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import EmailSubscription from "@components/UI/EmailSubscription";
import PhoneNumberSubscription from "@components/UI/PhoneNumberSubscription";
import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FOOTER_LINKS } from "@config/links";
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
  const tosHref = FOOTER_LINKS.find(link => link.label === "Terms")?.href;
  const chainCurrencySymbol = chains.find(chain => chain.name.toLowerCase() === chainName)?.nativeCurrency?.symbol;
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [buttonText, setButtonText] = useState(ButtonText.SUBMIT);
  const insufficientBalance = accountData && accountData.value === BigInt(0);

  useEffect(() => {
    setButtonText(insufficientBalance ? ButtonText.ADD_FUNDS : ButtonText.SUBMIT);
  }, [insufficientBalance]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
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
          <div className="flex flex-col gap-4">
            <CreateGradientTitle textSize="small" additionalInfo="optional">
              get updates by phone
            </CreateGradientTitle>
            <PhoneNumberSubscription
              phoneNumberAlreadyExists={phoneNumberAlreadyExists ?? false}
              phoneNumberError={phoneNumberError}
              phoneNumberForSubscription={phoneNumberForSubscription}
              handlePhoneNumberChange={handlePhoneNumberChange}
            />
          </div>

          <div className="flex flex-col gap-4 mt-4">
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
