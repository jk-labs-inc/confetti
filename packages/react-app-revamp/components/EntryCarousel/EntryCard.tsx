import { Proposal } from "@components/_pages/ProposalContent";
import ProposalLayoutGalleryRankOrPlaceholder from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery/components/RankOrPlaceholder";
import { Tweet } from "@components/_pages/ProposalContent/components/ProposalLayout/Tweet/components/CustomTweet";
import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import { entryMedal, withAlpha } from "@helpers/entryColors";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { CSSProperties, FC, ReactNode, useMemo } from "react";
import { useFitTextToBox } from "./useFitTextToBox";

const FOIL_PX = 1.5;

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const overlayTextStyle: CSSProperties = {
  color: "#E5E5E5",
  textShadow: "1px 1px 0 #000",
  WebkitTextStroke: "0.3px #000",
};

const overlayGradient = "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)";

interface EntryCardProps {
  proposal: Proposal;
  enabledPreview: EntryPreview | null;
  contestStatus: ContestStatus;
  totalVotes: number;
  active?: boolean;
  elevated?: boolean;
  variant?: "coverflow" | "feed";
  compact?: boolean;
}

type ParsedEntry =
  | { kind: "title"; title: string }
  | { kind: "image"; imageUrl: string; title: string }
  | { kind: "tweet"; tweetId: string; title: string };

const extractTweetId = (url: string): string => {
  const match = url?.match(/\/status\/(\d+)/);
  return match ? match[1] : "";
};

const parseEntry = (proposal: Proposal, enabledPreview: EntryPreview | null): ParsedEntry => {
  const raw = proposal.metadataFields?.stringArray?.[0] ?? "";

  switch (enabledPreview) {
    case EntryPreview.IMAGE:
      return { kind: "image", imageUrl: raw, title: "" };
    case EntryPreview.IMAGE_AND_TITLE: {
      const params = new URLSearchParams(raw);
      return {
        kind: "image",
        imageUrl: params.get("JOKERACE_IMG") || "",
        title: params.get("JOKERACE_IMG_TITLE") || "",
      };
    }
    case EntryPreview.TWEET:
      return { kind: "tweet", tweetId: extractTweetId(raw), title: "" };
    case EntryPreview.TWEET_AND_TITLE: {
      const params = new URLSearchParams(raw);
      return {
        kind: "tweet",
        tweetId: extractTweetId(params.get("JOKERACE_TWEET") || ""),
        title: params.get("JOKERACE_TWEET_TITLE") || "",
      };
    }
    case EntryPreview.TITLE:
    default:
      return { kind: "title", title: raw };
  }
};

const EntryCard: FC<EntryCardProps> = ({
  proposal,
  enabledPreview,
  contestStatus,
  totalVotes,
  active,
  elevated,
  variant = "coverflow",
  compact,
}) => {
  const entry = useMemo(() => parseEntry(proposal, enabledPreview), [proposal, enabledPreview]);
  const showVotes =
    (contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) && proposal.votes > 0;
  const isTitleOnly = entry.kind === "title";

  const titleText = isTitleOnly ? entry.title || "untitled entry" : "";
  const titleMaxFont = Math.round(Math.max(20, Math.min(32, 32 - (titleText.trim().length - 12) * 0.8)));
  const { ref: titleFitRef, fontSize: titleFontSize } = useFitTextToBox<HTMLDivElement>(titleText, 14, titleMaxFont);

  const medal = entryMedal(proposal.rank);
  const accent = medal.solid;

  const votesNumber: ReactNode = (
    <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse>
  );

  const votePercentage = totalVotes > 0 ? Math.round((proposal.votes / totalVotes) * 100) : 0;

  const isFeed = variant === "feed";
  const isRanked = !!proposal.rank;

  // The foil border carries the rank medal. Unranked entries — before voting opens, or any entry with no
  // standing yet — have no medal to surface, so they fall back to a neutral edge and lean on the elevation
  // shadow alone (no stray purple border while a contest hasn't started voting). In the feed only the active
  // card is allowed to show its medal, preserving that variant's single-highlight treatment.
  const showMedalFoil = isRanked && (!isFeed || active);
  const foilBg = showMedalFoil ? medal.background : "rgba(255,255,255,0.08)";

  // In the two-up layout each card is only ~half the screen wide, so the vote figures shrink to stay
  // legible instead of dominating the card.
  const pctSize = compact ? "text-[16px]" : "text-[24px]";
  const pctLabelSize = compact ? "text-[8px]" : "text-[9px]";
  const voteCountSize = compact ? "text-[16px]" : "text-[22px]";
  const overlayVoteCountSize = compact ? "text-[16px]" : "text-[24px]";
  const voteLabelSize = compact ? "text-[9px]" : "text-[10px]";

  // A black drop shadow is invisible on the true-black page, so elevated cards lift off the background with
  // the shared `--shadow-entry-card` grey-glow halo (the same one the desktop entries use), giving a defined
  // edge on every side — bottom included. Only the two-up uses the halo: its wrapper doesn't clip overflow,
  // whereas the coverflow wrapper clips its neighbours and would crop the halo, so that mode keeps the drop.
  const elevatedShadow = compact ? "var(--shadow-entry-card)" : "0 12px 32px -16px rgba(0,0,0,0.95)";
  const foilShadow = active
    ? `0 0 26px -4px ${withAlpha(accent, 0.5)}, 0 12px 32px -14px rgba(0,0,0,0.9)`
    : !isFeed && elevated
      ? elevatedShadow
      : undefined;

  const innerBg = isTitleOnly ? "linear-gradient(180deg, #1a1a1a 0%, #0c0c0c 54%, #050505 100%)" : "#000";

  if (isFeed) {
    return (
      <div
        className="relative w-full rounded-2xl transition-shadow duration-300 ease-out"
        style={{ background: foilBg, padding: FOIL_PX, boxShadow: foilShadow }}
      >
        <div className="relative flex w-full flex-col overflow-hidden rounded-[14px] bg-true-black">
          {entry.kind === "tweet" ? (
            <div className="w-full p-2">
              <Tweet id={entry.tweetId} apiUrl={`/api/tweet/${entry.tweetId}`} />
            </div>
          ) : null}

          {entry.title || showVotes ? (
            <div className="flex shrink-0 flex-col items-center gap-1 px-3 pb-3 pt-2">
              {entry.title ? <p className="text-center text-[16px] font-bold text-neutral-11">{entry.title}</p> : null}
              {showVotes ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-bold leading-none tabular-nums text-neutral-11">{votesNumber}</span>
                  <span
                    className="text-[10px] font-bold uppercase leading-none tracking-[0.22em]"
                    style={{ color: withAlpha(accent, 0.92) }}
                  >
                    votes
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: GRAIN_URL, backgroundSize: "120px 120px", opacity: 0.06 }}
          />

          {proposal.rank ? (
            <div className="pointer-events-none absolute left-2 top-2 z-10">
              <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full rounded-2xl transition-shadow duration-300 ease-out"
      style={{ background: foilBg, padding: FOIL_PX, boxShadow: foilShadow }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[14px]" style={{ background: innerBg }}>
        {entry.kind === "image" ? (
          entry.imageUrl?.trim() ? (
            <img src={entry.imageUrl} alt="entry image" className="absolute inset-0 h-full w-full object-cover" />
          ) : null
        ) : entry.kind === "tweet" ? (
          <div className="no-scrollbar absolute inset-0 overflow-y-auto">
            <div className="flex min-h-full w-full items-center justify-center p-2">
              <Tweet id={entry.tweetId} apiUrl={`/api/tweet/${entry.tweetId}`} />
            </div>
          </div>
        ) : (
          <div className="relative z-1 flex h-full w-full flex-col">
            <div
              ref={titleFitRef}
              className="flex flex-1 items-center justify-center overflow-hidden px-5 pb-3 pt-14"
              style={{ fontSize: `${titleFontSize}px` }}
            >
              <p
                className="font-sabo-filled text-balance text-center leading-[1.08] text-neutral-11 wrap-anywhere"
                style={{ textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
              >
                {titleText}
              </p>
            </div>
            {showVotes ? (
              <div className={`flex justify-center ${compact ? "pb-4" : "pb-5"}`}>
                <div className="inline-flex items-center gap-2">
                  <span className={`${voteCountSize} font-bold leading-none tabular-nums text-neutral-11`}>
                    {votesNumber}
                  </span>
                  <span
                    className={`${voteLabelSize} font-bold uppercase leading-none tracking-[0.22em]`}
                    style={{ color: withAlpha(accent, 0.92) }}
                  >
                    votes
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: GRAIN_URL, backgroundSize: "120px 120px", opacity: 0.06 }}
        />

        {proposal.rank ? (
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} />
          </div>
        ) : null}

        {isTitleOnly && showVotes && totalVotes > 0 ? (
          <div
            className={`pointer-events-none absolute z-10 flex flex-col items-end leading-none ${
              compact ? "right-2 top-2" : "right-3 top-3"
            }`}
          >
            <span className={`${pctSize} font-bold tabular-nums`} style={{ color: accent }}>
              {votePercentage}%
            </span>
            <span className={`mt-1 ${pctLabelSize} font-bold uppercase tracking-[0.18em] text-neutral-10`}>
              of votes
            </span>
          </div>
        ) : null}

        {!isTitleOnly && (entry.title || showVotes) ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1.5 px-3 pb-4 pt-12"
            style={{ background: overlayGradient }}
          >
            {entry.title ? (
              <p className="text-center text-[16px] font-bold leading-normal" style={overlayTextStyle}>
                {entry.title}
              </p>
            ) : null}
            {showVotes ? (
              <div className="flex items-baseline justify-center gap-2">
                <span className={`${overlayVoteCountSize} font-bold leading-none tabular-nums`} style={overlayTextStyle}>
                  {votesNumber}
                </span>
                <span
                  className={`${voteLabelSize} font-bold uppercase leading-none tracking-[0.22em]`}
                  style={{ color: accent, textShadow: "1px 1px 0 #000" }}
                >
                  votes
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EntryCard;
