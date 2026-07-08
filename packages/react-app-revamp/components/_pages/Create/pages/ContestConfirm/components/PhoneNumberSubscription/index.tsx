import PhoneNumberSubscription from "@components/UI/PhoneNumberSubscription";
import { PhoneNumberValue } from "lib/phone/types";
import { FC } from "react";

interface CreateContestConfirmPhoneNumberSubscriptionProps {
  phoneNumberError: string | null;
  phoneNumberForSubscription: PhoneNumberValue;
  handlePhoneNumberChange: (value: PhoneNumberValue) => void;
}

const CreateContestConfirmPhoneNumberSubscription: FC<CreateContestConfirmPhoneNumberSubscriptionProps> = ({
  phoneNumberError,
  phoneNumberForSubscription,
  handlePhoneNumberChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] text-neutral-11 font-bold">
        get updates by phone <span className="text-[12px] font-normal">(optional)</span>
      </p>
      <PhoneNumberSubscription
        phoneNumberError={phoneNumberError}
        phoneNumberForSubscription={phoneNumberForSubscription}
        handlePhoneNumberChange={handlePhoneNumberChange}
      />
    </div>
  );
};

export default CreateContestConfirmPhoneNumberSubscription;
