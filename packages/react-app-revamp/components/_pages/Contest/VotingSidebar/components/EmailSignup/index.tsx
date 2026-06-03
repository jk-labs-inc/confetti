import { emailRegex } from "@helpers/regex";
import useEmailSignup from "@hooks/useEmailSignup";
import { motion } from "motion/react";
import { useState } from "react";

const VotingSidebarEmailSignup = () => {
  const { subscribeUser, checkIfEmailExists, isLoading } = useEmailSignup();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailAlreadyExistsMessage, setEmailAlreadyExistsMessage] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError("");
    setEmailAlreadyExistsMessage("");
  };

  const isEmailValid = () => {
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (isLoading) return;

    if (!isEmailValid()) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const emailExists = await checkIfEmailExists({ emailAddress: email });

    if (!emailExists) {
      await subscribeUser(email);
      setEmail("");
      setEmailError("");
    } else {
      setEmailAlreadyExistsMessage("your email has already been subscribed! :)");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center h-14 bg-secondary-1 rounded-2xl border border-neutral-17 pl-4 pr-2 justify-center">
        <div className="flex flex-col gap-1">
          <label className="text-neutral-11 text-[12px]">email to get updates (optional)</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="bg-transparent text-[16px] outline-none text-neutral-11 placeholder-primary-3"
            placeholder="type email..."
          />
        </div>

        <motion.button
          disabled={isLoading}
          onClick={handleSubscribe}
          className="ml-auto text-true-black text-[16px] font-bold h-8 w-[104px] items-center justify-center bg-gradient-purple rounded-4xl"
          whileTap={{ scale: 0.97 }}
        >
          subscribe
        </motion.button>
      </div>
      {emailError ? (
        <p className="text-negative-11 text-[12px] font-bold pl-2">{emailError}</p>
      ) : emailAlreadyExistsMessage ? (
        <p className="text-positive-11 text-[12px] font-bold pl-2">{emailAlreadyExistsMessage}</p>
      ) : null}
    </div>
  );
};

export default VotingSidebarEmailSignup;
