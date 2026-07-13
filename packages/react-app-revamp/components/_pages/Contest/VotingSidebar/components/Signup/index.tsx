import UpdatesSignup from "@components/UI/UpdatesSignup";
import { emailRegex } from "@helpers/regex";
import useEmailSignup from "@hooks/useEmailSignup";
import usePhoneNumberSignup from "@hooks/usePhoneNumberSignup";
import { useWallet } from "@hooks/useWallet";
import { EMPTY_PHONE_NUMBER, isPhoneNumberEmpty, isValidPhoneNumber, phoneNumberToE164 } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { motion } from "motion/react";
import { useState } from "react";

const VotingSidebarSignup = () => {
  const { subscribeUser, checkIfEmailExists, isLoading: isEmailLoading } = useEmailSignup();
  const { subscribePhoneNumber, checkIfPhoneNumberExists, isLoading: isPhoneNumberLoading } = usePhoneNumberSignup();
  const { userAddress } = useWallet();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumberValue>(EMPTY_PHONE_NUMBER);
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [emailAlreadyExistsMessage, setEmailAlreadyExistsMessage] = useState("");
  const [phoneNumberAlreadyExistsMessage, setPhoneNumberAlreadyExistsMessage] = useState("");
  const isLoading = isEmailLoading || isPhoneNumberLoading;

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

  const handleEmailChange = (value: string) => {
    setEmail(value);
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
      const phoneNumberSubscribed = await subscribePhoneNumber(
        phoneNumberE164,
        userAddress ?? null,
        !willSubscribeEmail,
      );
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

      await subscribeUser(email, userAddress ?? null);
      setEmail("");
      setEmailError("");
    };

    await Promise.all([handlePhoneChannel(), handleEmailChannel()]);
  };

  return (
    <form noValidate onSubmit={handleSubscribe} className="flex flex-col gap-4">
      <UpdatesSignup
        phoneNumber={phoneNumber}
        email={email}
        onPhoneNumberChange={handlePhoneNumberChange}
        onEmailChange={handleEmailChange}
        phoneNumberError={phoneNumberError}
        emailError={emailError}
        phoneNumberMessage={phoneNumberAlreadyExistsMessage}
        emailMessage={emailAlreadyExistsMessage}
      />

      <motion.button
        type="submit"
        disabled={isSubmitDisabled}
        aria-busy={isLoading}
        className="flex items-center justify-center w-full h-10 text-true-black text-[16px] font-bold bg-gradient-purple rounded-4xl disabled:opacity-50 disabled:pointer-events-none"
        whileTap={{ scale: 0.97 }}
      >
        {submitLabel}
      </motion.button>
    </form>
  );
};

export default VotingSidebarSignup;
