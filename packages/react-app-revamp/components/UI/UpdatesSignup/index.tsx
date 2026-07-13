import PhoneNumberInput from "@components/UI/PhoneNumberInput";
import { FOOTER_LINKS } from "@config/links";
import { PhoneNumberValue } from "lib/phone/types";
import { FC, useId } from "react";
import UpdatesSignupField from "./components/Field";

interface UpdatesSignupProps {
  phoneNumber: PhoneNumberValue;
  email: string;
  onPhoneNumberChange: (value: PhoneNumberValue) => void;
  onEmailChange: (email: string) => void;
  phoneNumberError?: string | null;
  emailError?: string | null;
  phoneNumberMessage?: string | null;
  emailMessage?: string | null;
  titleVariant?: "plain" | "gradient";
  className?: string;
}

const UpdatesSignup: FC<UpdatesSignupProps> = ({
  phoneNumber,
  email,
  onPhoneNumberChange,
  onEmailChange,
  phoneNumberError,
  emailError,
  phoneNumberMessage,
  emailMessage,
  titleVariant = "plain",
  className,
}) => {
  const tosHref = FOOTER_LINKS.find(link => link.label === "Terms")?.href;
  const fieldId = useId();
  const phoneInputId = `${fieldId}-phone`;
  const emailInputId = `${fieldId}-email`;
  const titleClassName =
    titleVariant === "gradient" ? "bg-gradient-title bg-clip-text text-transparent" : "text-neutral-11";

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <p className={`text-[16px] font-bold ${titleClassName}`}>get updates</p>

      <div className="flex flex-col gap-2">
        <UpdatesSignupField
          label="phone number (optional)"
          htmlFor={phoneInputId}
          error={phoneNumberError}
          message={phoneNumberMessage}
        >
          <PhoneNumberInput
            id={phoneInputId}
            value={phoneNumber}
            onChange={onPhoneNumberChange}
            inputClassName="placeholder-neutral-10"
          />
        </UpdatesSignupField>

        <UpdatesSignupField label="email (optional)" htmlFor={emailInputId} error={emailError} message={emailMessage}>
          <input
            id={emailInputId}
            type="email"
            value={email}
            onChange={event => onEmailChange(event.target.value)}
            className="bg-transparent text-[16px] outline-none text-neutral-11 placeholder-neutral-10"
            placeholder="myemail@email.com"
          />
        </UpdatesSignupField>

        <p className="opacity-50 text-neutral-11 text-[12px] pl-2">
          by providing your info, you agree to{" "}
          <a className="text-positive-11 hover:text-positive-10" href={tosHref} rel="nofollow noreferrer" target="_blank">
            our terms of service
          </a>
        </p>
      </div>
    </div>
  );
};

export default UpdatesSignup;
