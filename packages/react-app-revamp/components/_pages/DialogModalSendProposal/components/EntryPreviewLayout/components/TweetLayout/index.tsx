import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FC, useState, useCallback } from "react";
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
      <div className="relative">
        <input
          type="text"
          onChange={handleInputChange}
          className="w-full text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 h-12 indent-4 focus:outline-none pr-10"
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
