import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FC, useState, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import { debounce } from "lodash";
import { twitterRegex } from "@helpers/regex";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface DialogModalSendProposalEntryPreviewTweetLayoutProps {
  onChange?: (value: string) => void;
}

const DialogModalSendProposalEntryPreviewTweetLayout: FC<DialogModalSendProposalEntryPreviewTweetLayoutProps> = ({
  onChange,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const checkTweet = useCallback(
    debounce(async (url: string) => {
      if (!url) {
        setIsValid(null);
        return;
      }

      const match = url.match(twitterRegex);
      if (!match) {
        setIsValid(false);
        onChange?.("");
        return;
      }

      const tweetId = match[2] || match[4]; // get id from either twitter.com or x.com match
      if (!tweetId) {
        setIsValid(false);
        onChange?.("");
        return;
      }

      setIsValid(true);
    }, 500),
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange?.(value);
    checkTweet(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <CreateGradientTitle textSize="small">tweet</CreateGradientTitle>
      <div
        className={`bg-true-black rounded-[16px] border-true-black ${
          isMobile ? "" : "shadow-file-upload p-2"
        } relative`}
      >
        <input
          type="text"
          onChange={handleInputChange}
          className="text-[16px] bg-secondary-1 outline-none rounded-[16px] placeholder-neutral-10 w-full h-12 indent-4 focus:outline-none pr-10"
          placeholder="www.x.com/me/status/18431..."
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValid === true && <CheckCircleIcon className="text-positive-11 w-6 h-6 animate-fade-in" />}
          {isValid === false && <XCircleIcon className="text-negative-11 w-6 h-6 animate-fade-in" />}
        </div>
      </div>
    </div>
  );
};

export default DialogModalSendProposalEntryPreviewTweetLayout;
