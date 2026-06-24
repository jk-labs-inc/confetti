import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { entryMedal, withAlpha } from "@helpers/entryColors";
import { formatNumber } from "@helpers/formatNumber";
import useNow from "@hooks/useNow";
import useProfileData from "@hooks/useProfileData";
import { CSSProperties, FC, KeyboardEvent as ReactKeyboardEvent, memo, useEffect, useRef, useState } from "react";
import { useFitText } from "../hooks/useFitText";
import { PositionedVote } from "../types";

export interface VoterChipData {
  uuid: string;
  userAddress: string;
  priceText: string;
  voteAmount: number;
  createdAt: number;
  rank?: number;
  entryTitle?: string;
}

export function voterChipData(
  vote: PositionedVote,
  rankById: Map<string, number>,
  entryTitlesById: Map<string, string>,
  formatPrice: (nativePrice: number) => string,
): VoterChipData {
  return {
    uuid: vote.uuid,
    userAddress: vote.userAddress,
    priceText: formatPrice(vote.totalCost),
    voteAmount: vote.voteAmount,
    createdAt: vote.createdAt,
    rank: rankById.get(vote.proposalId),
    entryTitle: entryTitlesById.get(vote.proposalId),
  };
}

interface VoterChipProps extends VoterChipData {
  width: string;
  isActive: boolean;
  isNew?: boolean;
  onSelect?: (uuid: string) => void;
  onHover?: (uuid: string) => void;
  onSeen?: (uuid: string) => void;
}

const timeAgo = (sec: number, nowMs: number): string => {
  const d = Math.max(0, Math.floor(nowMs / 1000) - sec);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const TimeAgo: FC<{ createdAt: number }> = ({ createdAt }) => {
  const now = useNow();
  return <div className="whitespace-nowrap text-[10.5px] text-neutral-9">{timeAgo(createdAt, now)}</div>;
};

const compactVotes = (n: number): string =>
  n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : formatNumber(n);

const PRICE_FONT_SIZES = [14, 12, 10];

const GRADIENT_TEXT: CSSProperties = {
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const VoterChip: FC<VoterChipProps> = ({
  uuid,
  userAddress,
  priceText,
  voteAmount,
  createdAt,
  rank,
  entryTitle,
  width,
  isActive,
  isNew,
  onSelect,
  onHover,
  onSeen,
}) => {
  const { profileName, profileAvatar } = useProfileData(userAddress, true);
  const priceRef = useRef<HTMLSpanElement>(null);
  const priceFontSize = useFitText(priceRef, priceText, PRICE_FONT_SIZES);

  const medal = entryMedal(rank);

  const [entering] = useState(!!isNew);
  useEffect(() => {
    if (entering) onSeen?.(uuid);
  }, [entering, uuid, onSeen]);

  const style: CSSProperties = {
    flex: `0 0 ${width}`,
    width,
    scrollSnapAlign: "start",
    borderColor: isActive ? withAlpha(medal.solid, 0.6) : undefined,
    boxShadow: isActive ? `0 6px 16px -12px ${withAlpha(medal.solid, 0.55)}` : undefined,
  };

  const titleStyle: CSSProperties = medal.isGradient
    ? { backgroundImage: medal.background, ...GRADIENT_TEXT }
    : { color: medal.solid };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(uuid);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(uuid)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover?.(uuid)}
      aria-label={`${profileName} bought ${formatNumber(voteAmount)} ${
        voteAmount === 1 ? "vote" : "votes"
      } for ${entryTitle ?? "an entry"}, ${priceText}`}
      className={`box-border flex shrink-0 cursor-pointer flex-col gap-[9px] overflow-hidden rounded-[15px] border bg-neutral-2 p-[11px] text-left transition-[border-color,box-shadow,transform] duration-150 ${
        isActive ? "-translate-y-0.5" : "border-neutral-4"
      } ${entering ? "voter-chip-enter" : ""}`}
      style={style}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar src={profileAvatar} address={userAddress} size="small" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <CustomLink
            href={ROUTE_VIEW_USER.replace("[address]", userAddress)}
            target="_blank"
            onClick={e => e.stopPropagation()}
            className="block truncate text-[12px] font-semibold text-neutral-11 no-underline hover:underline"
          >
            {profileName}
          </CustomLink>
          <TimeAgo createdAt={createdAt} />
        </div>
      </div>

      <div className="flex min-w-0 items-baseline gap-1">
        <span className="flex-none whitespace-nowrap text-[16px] font-extrabold text-neutral-11">
          +{compactVotes(voteAmount)}{" "}
          <span className="text-[11px] font-semibold text-neutral-9">{voteAmount === 1 ? "vote" : "votes"}</span>
        </span>
        <span
          ref={priceRef}
          className="min-w-0 flex-1 truncate text-right font-semibold text-neutral-9"
          style={{ fontSize: priceFontSize }}
        >
          {priceText}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-1.5">
        <span className="flex-none text-[10.5px] text-neutral-9">for</span>
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: medal.solid }} />
        {entryTitle ? (
          <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold" style={titleStyle}>
            {entryTitle}
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-neutral-9">an entry</span>
        )}
      </div>
    </div>
  );
};

export default memo(VoterChip);
