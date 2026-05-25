import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { twitterRegex } from "@helpers/regex";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { debounce } from "lodash";
import { FC, useCallback, useState } from "react";
import { MAX_TITLE_LENGTH } from "../../constants";

interface DialogModalSendProposalEntryPreviewTweetAndTitleLayoutProps {
  onChange?: (value: string) => void;
}

const DialogModalSendProposalEntryPreviewTweetAndTitleLayout: FC<
  DialogModalSendProposalEntryPreviewTweetAndTitleLayoutProps
> = ({ onChange }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [title, setTitle] = useState("");

  const checkTweet = useCallback(
    debounce(async (url: string) => {
      if (!url) {
        setIsValid(null);
        return;
      }

      const match = url.match(twitterRegex);
      if (!match) {
        setIsValid(false);
        return;
      }

      const tweetId = match[2] || match[4]; // get id from either twitter.com or x.com match
      if (!tweetId) {
        setIsValid(false);
        return;
      }

      setIsValid(true);
    }, 500),
    [],
  );

  const updateCombinedValue = (newTweetUrl: string = tweetUrl, newTitle: string = title) => {
    // if both values are empty, return empty string
    if (!newTweetUrl || !newTitle) {
      onChange?.("");
      return;
    }

    // sanitize values - empty strings if undefined/null
    const sanitizedTweet = newTweetUrl?.trim() || "";
    const sanitizedTitle = newTitle?.trim() || "";

    const combinedValue = `JOKERACE_TWEET=${encodeURIComponent(sanitizedTweet)}&JOKERACE_TWEET_TITLE=${encodeURIComponent(sanitizedTitle)}`;
    onChange?.(combinedValue);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    updateCombinedValue(tweetUrl, value);
  };

  const handleTweetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTweetUrl(value);
    checkTweet(value);
    updateCombinedValue(value, title);
  };

  return (
    <div className="flex flex-col gap-4">
      <CreateGradientTitle textSize="small">title</CreateGradientTitle>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="w-full text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 placeholder-neutral-10 h-12 indent-4 focus:outline-none"
        placeholder="this is my entry..."
        maxLength={MAX_TITLE_LENGTH}
      />
      <p className="text-[16px] text-[#6A6A6A] ml-4">
        {title.length}/{MAX_TITLE_LENGTH} characters
      </p>
      <CreateGradientTitle textSize="small">tweet</CreateGradientTitle>
      <div className="relative">
        <input
          type="text"
          value={tweetUrl}
          onChange={handleTweetChange}
          className="w-full text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 placeholder-neutral-10 h-12 indent-4 focus:outline-none pr-10"
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

export default DialogModalSendProposalEntryPreviewTweetAndTitleLayout;
