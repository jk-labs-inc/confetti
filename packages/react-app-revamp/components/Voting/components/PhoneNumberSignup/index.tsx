import PhoneNumberInput from "@components/UI/PhoneNumberInput";
import { useVotingStore } from "@components/Voting/store";
import { EMPTY_PHONE_NUMBER, isPhoneNumberEmpty, isValidPhoneNumber, phoneNumberToE164 } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const VotingWidgetPhoneNumberSignup: FC = () => {
  const setPhoneNumber = useVotingStore(useShallow(state => state.setPhoneNumber));
  const resetSignupsNonce = useVotingStore(state => state.resetSignupsNonce);
  const [inputValue, setInputValue] = useState<PhoneNumberValue>(EMPTY_PHONE_NUMBER);
  const isInvalid = !isPhoneNumberEmpty(inputValue) && !isValidPhoneNumber(inputValue);

  useEffect(() => {
    if (isValidPhoneNumber(inputValue)) {
      setPhoneNumber(phoneNumberToE164(inputValue));
    } else {
      setPhoneNumber("");
    }
  }, [inputValue, setPhoneNumber]);

  useEffect(() => {
    setInputValue(EMPTY_PHONE_NUMBER);
  }, [resetSignupsNonce]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 h-14 bg-secondary-1 rounded-2xl border border-neutral-17 px-4 justify-center">
        <label className="text-neutral-11 text-[12px]">phone number (optional)</label>
        <PhoneNumberInput
          value={inputValue}
          onChange={setInputValue}
          inputClassName="placeholder-primary-3"
          placeholder="type your phone number to get updates..."
        />
      </div>
      {isInvalid ? (
        <p className="text-negative-11 text-[12px] font-bold pl-2">Please enter a valid phone number.</p>
      ) : null}
    </div>
  );
};

export default VotingWidgetPhoneNumberSignup;
