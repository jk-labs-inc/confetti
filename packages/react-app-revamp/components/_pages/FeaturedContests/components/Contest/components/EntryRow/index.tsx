import CustomLink from "@components/UI/Link";
import { ENTRY_ROW_THUMB_PRESET } from "lib/image/cloudflare";
import { useCloudflareImage } from "lib/image/useCloudflareImage";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { CardEntry, CardState } from "../../types";
import EntryVotePill from "../EntryVotePill";

/** uneven widths so a loading list reads like titles rather than a stack of identical bars. */
const TITLE_PLACEHOLDER_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/12"];

interface EntryRowProps {
  entry: CardEntry;
  contestUrl: string;
  cardState: CardState;
  hasEntryImages: boolean;
  onVoteClick: (entry: CardEntry) => void;
}

const EntryRow: FC<EntryRowProps> = ({ entry, contestUrl, cardState, hasEntryImages, onVoteClick }) => {
  const isEnded = cardState === "ended" || cardState === "canceled";
  const isLive = cardState === "live";
  const showPercent = entry.percent !== null;
  const showEntryMarker = !hasEntryImages && !showPercent;
  const showBar = showPercent && Math.round(entry.percent as number) > 0;
  const { src, srcSet } = useCloudflareImage(entry.image, ENTRY_ROW_THUMB_PRESET);
  const rightGutter = showPercent ? (isLive ? "pr-[88px]" : "pr-14") : "";
  const placeholderWidth =
    TITLE_PLACEHOLDER_WIDTHS[entry.id.charCodeAt(entry.id.length - 1) % TITLE_PLACEHOLDER_WIDTHS.length];

  return (
    <div className="relative h-10 shrink-0">
      <CustomLink href={contestUrl} className={`flex items-center gap-3 h-full ${rightGutter}`}>
        {hasEntryImages &&
          (entry.isTitlePending ? (
            <Skeleton width={36} height={36} borderRadius={6} baseColor="#212121" highlightColor="#100816" />
          ) : entry.image ? (
            <img src={src} srcSet={srcSet} alt="" className="w-9 h-9 rounded-md object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-md bg-primary-2 shrink-0" />
          ))}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {entry.isTitlePending ? (
            // h-6 matches the title's line-height, so the real title lands without shifting the row.
            <div className="h-6 flex items-center">
              <div className={placeholderWidth}>
                <Skeleton height={14} borderRadius={4} baseColor="#212121" highlightColor="#100816" />
              </div>
            </div>
          ) : (
            <p className={`text-base font-bold normal-case truncate ${isEnded ? "text-neutral-9" : "text-neutral-11"}`}>
              {showEntryMarker && <span className="font-normal text-neutral-9 mr-2">›</span>}
              {entry.title ?? "untitled entry"}
            </p>
          )}
          {showPercent && (
            <div className="h-0.5 w-full">
              {showBar && <div className="h-full rounded-full bg-positive-11" style={{ width: `${entry.percent}%` }} />}
            </div>
          )}
        </div>
      </CustomLink>
      {isLive && showPercent && (
        <EntryVotePill
          percent={entry.percent as number}
          onClick={() => onVoteClick(entry)}
          className="absolute right-0 top-1/2 -translate-y-1/2"
        />
      )}
      {isEnded && showPercent && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-9">
          {Math.round(entry.percent as number)}%
        </span>
      )}
    </div>
  );
};

export default EntryRow;
