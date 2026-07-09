import PhoneNumberInput from "@components/UI/PhoneNumberInput";
import { FOOTER_LINKS } from "@config/links";
import { emailRegex } from "@helpers/regex";
import useEmailSignup from "@hooks/useEmailSignup";
import usePhoneNumberSignup from "@hooks/usePhoneNumberSignup";
import { EMPTY_PHONE_NUMBER, isPhoneNumberEmpty, isValidPhoneNumber, phoneNumberToE164 } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { motion } from "motion/react";
import { useId, useState } from "react";

const VotingSidebarSignup = () => {
  const { subscribeUser, checkIfEmailExists, isLoading: isEmailLoading } = useEmailSignup();
  const { subscribePhoneNumber, checkIfPhoneNumberExists, isLoading: isPhoneNumberLoading } = usePhoneNumberSignup();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumberValue>(EMPTY_PHONE_NUMBER);
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [emailAlreadyExistsMessage, setEmailAlreadyExistsMessage] = useState("");
  const [phoneNumberAlreadyExistsMessage, setPhoneNumberAlreadyExistsMessage] = useState("");
  const isLoading = isEmailLoading || isPhoneNumberLoading;
  const tosHref = FOOTER_LINKS.find(link => link.label === "Terms")?.href;
  const fieldId = useId();
  const phoneInputId = `${fieldId}-phone`;
  const emailInputId = `${fieldId}-email`;

  const isEmailEmpty = email === "";
  const isPhoneEmpty = isPhoneNumberEmpty(phoneNumber);
  const isSubmitDisabled = isLoading || (isEmailEmpty && isPhoneEmpty);
  const submitLabel = isLoading
    ? "signing you up..."
    : !isPhoneEmpty && isEmailEmpty
      ? "text me updates"
      : isPhoneEmpty && !isEmailEmpty
        ? "email me updates"
        : "get updates";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError("");
    setEmailAlreadyExistsMessage("");
  };

  const handlePhoneNumberChange = (value: PhoneNumberValue) => {
    setPhoneNumber(value);
    setPhoneNumberError("");
    setPhoneNumberAlreadyExistsMessage("");
  };

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading || (isEmailEmpty && isPhoneEmpty)) return;

    if (!isPhoneEmpty && !isValidPhoneNumber(phoneNumber)) {
      setPhoneNumberError("Please enter a valid phone number.");
      return;
    }

    if (!isEmailEmpty && !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const emailExistsPromise = isEmailEmpty ? Promise.resolve(false) : checkIfEmailExists({ emailAddress: email });
    const phoneNumberE164 = isPhoneEmpty ? "" : phoneNumberToE164(phoneNumber);

    const handlePhoneChannel = async () => {
      if (isPhoneEmpty) return;

      const phoneNumberExists = await checkIfPhoneNumberExists({ phoneNumber: phoneNumberE164 });

      if (phoneNumberExists) {
        setPhoneNumberAlreadyExistsMessage("your phone number has already been subscribed! :)");
        return;
      }

      const willSubscribeEmail = !isEmailEmpty && !(await emailExistsPromise);
      // only toast from the phone subscription when the email one isn't about to toast too
      const phoneNumberSubscribed = await subscribePhoneNumber(phoneNumberE164, null, !willSubscribeEmail);
      if (phoneNumberSubscribed) {
        setPhoneNumber(EMPTY_PHONE_NUMBER);
        setPhoneNumberError("");
      } else if (willSubscribeEmail) {
        // the suppressed toast would have carried the error — surface it inline instead
        setPhoneNumberError("There was an error while subscribing your phone number. Please try again later.");
      }
    };

    const handleEmailChannel = async () => {
      if (isEmailEmpty) return;

      const emailExists = await emailExistsPromise;

      if (emailExists) {
        setEmailAlreadyExistsMessage("your email has already been subscribed! :)");
        return;
      }

      await subscribeUser(email);
      setEmail("");
      setEmailError("");
    };

    await Promise.all([handlePhoneChannel(), handleEmailChannel()]);
  };

  return (
    <form noValidate onSubmit={handleSubscribe} className="flex flex-col gap-2">
      <div className="flex flex-col">
        <div className="flex flex-col gap-1 h-14 bg-secondary-1 rounded-2xl border border-neutral-17 px-4 justify-center">
          <label htmlFor={phoneInputId} className="text-neutral-11 text-[12px]">
            phone number (optional)
          </label>
          <PhoneNumberInput
            id={phoneInputId}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            inputClassName="placeholder-primary-3"
            placeholder="type phone number..."
          />
        </div>
        <div aria-live="polite">
          {phoneNumberError ? (
            <p className="text-negative-11 text-[12px] font-bold pl-2 mt-1">{phoneNumberError}</p>
          ) : phoneNumberAlreadyExistsMessage ? (
            <p className="text-positive-11 text-[12px] font-bold pl-2 mt-1">{phoneNumberAlreadyExistsMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-col gap-1 h-14 bg-secondary-1 rounded-2xl border border-neutral-17 px-4 justify-center">
          <label htmlFor={emailInputId} className="text-neutral-11 text-[12px]">
            email (optional)
          </label>
          <input
            id={emailInputId}
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="bg-transparent text-[16px] outline-none text-neutral-11 placeholder-primary-3"
            placeholder="type email..."
          />
        </div>
        <div aria-live="polite">
          {emailError ? (
            <p className="text-negative-11 text-[12px] font-bold pl-2 mt-1">{emailError}</p>
          ) : emailAlreadyExistsMessage ? (
            <p className="text-positive-11 text-[12px] font-bold pl-2 mt-1">{emailAlreadyExistsMessage}</p>
          ) : null}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitDisabled}
        aria-busy={isLoading}
        className="flex items-center justify-center w-full h-12 text-true-black text-[16px] font-bold bg-gradient-purple rounded-4xl disabled:opacity-50 disabled:pointer-events-none"
        whileTap={{ scale: 0.97 }}
      >
        {submitLabel}
      </motion.button>

      <p className="opacity-50 text-neutral-11 text-[12px] pl-2">
        by sharing your email or phone number with jk labs, you agree to{" "}
        <a className="text-positive-11 hover:text-positive-10" href={tosHref} rel="nofollow noreferrer" target="_blank">
          our terms of service
        </a>
      </p>
    </form>
  );
};

export default VotingSidebarSignup;
