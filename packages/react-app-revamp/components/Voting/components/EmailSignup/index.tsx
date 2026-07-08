import { useVotingStore } from "@components/Voting/store";
import { emailRegex } from "@helpers/regex";
import { FC, useState, useEffect } from "react";
import { useShallow } from "zustand/shallow";

const VotingWidgetEmailSignup: FC = () => {
  const setEmailAddress = useVotingStore(useShallow(state => state.setEmailAddress));
  const resetSignupsNonce = useVotingStore(state => state.resetSignupsNonce);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (inputValue === "" || emailRegex.test(inputValue)) {
      setEmailAddress(inputValue);
    } else {
      setEmailAddress("");
    }
  }, [inputValue, setEmailAddress]);

  useEffect(() => {
    setInputValue("");
  }, [resetSignupsNonce]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1 h-14 bg-secondary-1 rounded-2xl border border-neutral-17 px-4 justify-center">
      <label className="text-neutral-11 text-[12px]">email (optional)</label>
      <input
        type="email"
        value={inputValue}
        onChange={handleEmailChange}
        className="bg-transparent text-[16px] outline-none text-neutral-11 placeholder-primary-3"
        placeholder="type your email to get updates..."
      />
    </div>
  );
};

export default VotingWidgetEmailSignup;
