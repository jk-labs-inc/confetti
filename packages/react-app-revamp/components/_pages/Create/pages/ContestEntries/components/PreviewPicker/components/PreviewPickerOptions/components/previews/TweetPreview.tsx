import { MyTweet } from "@components/_pages/ProposalContent/components/ProposalLayout/Tweet/components/CustomTweet/custom-tweet";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { MediaQuery } from "@helpers/mediaQuery";
import { useTweet } from "react-tweet";

const TWEET_ID = "2041656312338248050";
const TWEET_API_URL = `/api/tweet/${TWEET_ID}`;
const VOTES = 1248;

const DesktopTweet = () => {
  const { data, error, isLoading } = useTweet(TWEET_ID, TWEET_API_URL);

  if (isLoading || error || !data) {
    return <StaticTweet />;
  }

  return (
    <div data-theme="light" className="not-prose">
      <MyTweet tweet={data} />
    </div>
  );
};

const StaticTweet = () => (
  <div className="w-full bg-neutral-11 rounded-lg border border-[rgb(207,217,222)] p-2 flex flex-col gap-1 text-left overflow-hidden">
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-true-black flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="/confetti/confetti-logo.png" alt="confetti" className="w-4 h-4 object-contain" />
      </div>
      <div className="flex flex-col min-w-0 leading-tight">
        <p className="text-[10px] font-bold text-true-black truncate">confetti</p>
        <p className="text-[9px] text-neutral-9 truncate">@confetti_win</p>
      </div>
    </div>
    <p className="text-[10px] text-true-black leading-snug line-clamp-3">
      this will go down as the most important taco tuesday in history
    </p>
  </div>
);

const TweetPreview = () => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 p-1.5 md:p-2 bg-true-black rounded-xl md:rounded-2xl shadow-entry-card w-full h-full max-w-[372px] border border-transparent overflow-hidden">
      <div className="pl-1 md:pl-2 items-center flex w-full">
        <img src="/contest/gold-medal.png" alt="Rank 1" className="w-6 h-6 md:w-10 md:h-10 object-contain" />
        <div className="flex flex-col gap-0.5 md:gap-1 items-end ml-auto">
          <p className="text-[10px] md:text-[12px] font-bold text-neutral-11">confetti tweet</p>
          <p className="text-[10px] md:text-[12px] text-neutral-11 tabular-nums">
            {formatNumberWithCommas(VOTES)} votes
          </p>
        </div>
      </div>
      <MediaQuery maxWidth={768}>
        <StaticTweet />
      </MediaQuery>
      <MediaQuery minWidth={769}>
        <DesktopTweet />
      </MediaQuery>
    </div>
  );
};

export default TweetPreview;
