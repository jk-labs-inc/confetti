"use client";

import { FrameLoader } from "@components/UI/Loader/FrameLoader";
import { type TweetProps, useTweet } from "react-tweet";
import CustomTweetNotFound from "./custom-not-found";
import { MyTweet } from "./custom-tweet";

const TweetLoader = () => (
  <div className="flex items-center justify-center w-full min-h-[180px]">
    <FrameLoader size={48} />
  </div>
);

export const Tweet = ({ id, apiUrl, fallback = <TweetLoader />, components, onError }: TweetProps) => {
  const { data, error, isLoading } = useTweet(id, apiUrl);

  if (isLoading) return fallback;
  if (error || !data) {
    return <CustomTweetNotFound id={id} error={onError ? onError(error) : error} />;
  }

  return (
    <div data-theme="light" className="not-prose">
      <MyTweet tweet={data} components={components} />
    </div>
  );
};
