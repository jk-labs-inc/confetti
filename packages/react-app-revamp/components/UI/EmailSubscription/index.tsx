import { FC } from "react";

interface EmailSubscriptionProps {
  emailForSubscription: string;
  emailError?: string | null;
  emailAlreadyExists?: boolean;
  tosHref?: string;
  handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailSubscription: FC<EmailSubscriptionProps> = ({
  emailForSubscription,
  emailError,
  emailAlreadyExists,
  tosHref,
  handleEmailChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <input
          value={emailForSubscription}
          type="text"
          className="w-full md:w-[328px] text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 placeholder-neutral-10 h-12 indent-4 focus:outline-none"
          placeholder="myemail@email.com"
          onChange={handleEmailChange}
        />

        {emailError ? (
          <p className="text-[14px] text-negative-11 font-bold pl-2 mt-2">{emailError}</p>
        ) : emailAlreadyExists ? (
          <p className="text-positive-11 text-[12px] font-bold pl-2">your email has already been subscribed! :)</p>
        ) : (
          <p className="opacity-50 text-neutral-11 text-[12px]">
            by sharing your email with jk labs, you agree to{" "}
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
    </div>
  );
};

export default EmailSubscription;
