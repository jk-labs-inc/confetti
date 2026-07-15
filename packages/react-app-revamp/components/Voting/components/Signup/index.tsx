import UpdatesSignup from "@components/UI/UpdatesSignup";
import { useVotingStore } from "@components/Voting/store";
import { emailRegex } from "@helpers/regex";
import { EMPTY_PHONE_NUMBER, isPhoneNumberEmpty, isValidPhoneNumber, phoneNumberToE164 } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const VotingWidgetSignup: FC = () => {
  const setEmailAddress = useVotingStore(useShallow(state => state.setEmailAddress));
  const setPhoneNumber = useVotingStore(useShallow(state => state.setPhoneNumber));
  const resetSignupsNonce = useVotingStore(state => state.resetSignupsNonce);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumberValue] = useState<PhoneNumberValue>(EMPTY_PHONE_NUMBER);
  const isPhoneNumberInvalid = !isPhoneNumberEmpty(phoneNumber) && !isValidPhoneNumber(phoneNumber);

  useEffect(() => {
    if (isValidPhoneNumber(phoneNumber)) {
      setPhoneNumber(phoneNumberToE164(phoneNumber));
    } else {
      setPhoneNumber("");
    }
  }, [phoneNumber, setPhoneNumber]);

  useEffect(() => {
    if (email === "" || emailRegex.test(email)) {
      setEmailAddress(email);
    } else {
      setEmailAddress("");
    }
  }, [email, setEmailAddress]);

  useEffect(() => {
    setPhoneNumberValue(EMPTY_PHONE_NUMBER);
    setEmail("");
  }, [resetSignupsNonce]);

  return (
    <UpdatesSignup
      phoneNumber={phoneNumber}
      email={email}
      onPhoneNumberChange={setPhoneNumberValue}
      onEmailChange={setEmail}
      phoneNumberError={isPhoneNumberInvalid ? "Please enter a valid phone number." : null}
    />
  );
};

export default VotingWidgetSignup;
