import { Tweet } from "@components/_pages/ProposalContent/components/ProposalLayout/Tweet/components/CustomTweet";
import { formatNumberWithCommas } from "@helpers/formatNumber";

const TWEET_ID = "2041656312338248050";
const VOTES = 1248;

const TweetPreview = () => {
  return (
    <div className="flex flex-col gap-4 p-2 bg-true-black rounded-2xl shadow-entry-card w-full h-full max-w-[372px] border border-transparent">
      <div className="pl-2 items-center flex w-full">
        <img src="/contest/gold-medal.png" alt="Rank 1" className="w-10 h-10 object-contain" />
        <div className="flex flex-col gap-1 items-end ml-auto">
          <p className="text-[12px] font-bold text-neutral-11">confetti tweet</p>
          <p className="text-[12px] text-neutral-11 tabular-nums">{formatNumberWithCommas(VOTES)} votes</p>
        </div>
      </div>
      <Tweet id={TWEET_ID} apiUrl={`/api/tweet/${TWEET_ID}`} />
    </div>
  );
};

export default TweetPreview;
