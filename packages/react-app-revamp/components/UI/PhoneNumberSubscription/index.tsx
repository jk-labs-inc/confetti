import PhoneNumberInput from "@components/UI/PhoneNumberInput";
import { FOOTER_LINKS } from "@config/links";
import { PhoneNumberValue } from "lib/phone/types";
import { FC } from "react";

interface PhoneNumberSubscriptionProps {
  phoneNumberForSubscription: PhoneNumberValue;
  phoneNumberError?: string | null;
  phoneNumberAlreadyExists?: boolean;
  handlePhoneNumberChange: (value: PhoneNumberValue) => void;
}

const PhoneNumberSubscription: FC<PhoneNumberSubscriptionProps> = ({
  phoneNumberForSubscription,
  phoneNumberError,
  phoneNumberAlreadyExists,
  handlePhoneNumberChange,
}) => {
  const tosHref = FOOTER_LINKS.find(link => link.label === "Terms")?.href;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center w-full md:w-[328px] h-12 bg-secondary-1 rounded-[10px] border border-neutral-17 px-4">
        <PhoneNumberInput
          value={phoneNumberForSubscription}
          onChange={handlePhoneNumberChange}
          inputClassName="placeholder-neutral-10"
        />
      </div>

      {phoneNumberError ? (
        <p className="text-[14px] text-negative-11 font-bold pl-2 mt-2">{phoneNumberError}</p>
      ) : phoneNumberAlreadyExists ? (
        <p className="text-positive-11 text-[12px] font-bold pl-2">your phone number has already been subscribed! :)</p>
      ) : (
        <p className="opacity-50 text-neutral-11 text-[12px]">
          by sharing your phone number with jk labs, you agree to{" "}
          <a
            className="text-positive-11 hover:text-positive-10"
            href={tosHref}
            rel="nofollow noreferrer"
            target="_blank"
          >
            our terms of service
          </a>
        </p>
      )}
    </div>
  );
};

export default PhoneNumberSubscription;
