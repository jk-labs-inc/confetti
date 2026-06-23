import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { colorOf, withAlpha } from "@helpers/entryColors";
import { formatNumber } from "@helpers/formatNumber";
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
  color: string;
  entryTitle?: string;
}

export function voterChipData(
  vote: PositionedVote,
  entryColors: Map<string, string>,
  entryTitlesById: Map<string, string>,
  formatPrice: (nativePrice: number) => string,
): VoterChipData {
  return {
    uuid: vote.uuid,
    userAddress: vote.userAddress,
    priceText: formatPrice(vote.totalCost),
    voteAmount: vote.voteAmount,
    createdAt: vote.createdAt,
    color: colorOf(entryColors, vote.proposalId),
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

const timeAgo = (sec: number): string => {
  const d = Math.max(0, Math.floor(Date.now() / 1000) - sec);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const compactVotes = (n: number): string =>
  n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : formatNumber(n);

const PRICE_FONT_SIZES = [16, 14, 12];

const VoterChip: FC<VoterChipProps> = ({
  uuid,
  userAddress,
  priceText,
  voteAmount,
  createdAt,
  color,
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

  const [entering] = useState(!!isNew);
  useEffect(() => {
    if (entering) onSeen?.(uuid);
  }, [entering, uuid, onSeen]);

  const style: CSSProperties = {
    flex: `0 0 ${width}`,
    width,
    scrollSnapAlign: "start",
    borderColor: isActive ? withAlpha(color, 0.6) : undefined,
    boxShadow: isActive ? `0 6px 16px -12px ${withAlpha(color, 0.55)}` : undefined,
  };

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
      aria-label={`${profileName}, ${formatNumber(voteAmount)} votes for ${priceText}${
        entryTitle ? `, ${entryTitle}` : ""
      }`}
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
          <div className="whitespace-nowrap text-[10.5px] text-neutral-9">{timeAgo(createdAt)}</div>
        </div>
      </div>

      <div className="flex min-w-0 items-baseline gap-1">
        <span ref={priceRef} className="truncate font-extrabold text-neutral-11" style={{ fontSize: priceFontSize }}>
          {priceText}
        </span>
        <span className="ml-auto flex-none whitespace-nowrap text-[10.5px] text-neutral-9">
          {compactVotes(voteAmount)} votes
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-1.5">
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: color }} />
        <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold" style={{ color }}>
          {entryTitle ?? ""}
        </span>
      </div>
    </div>
  );
};

export default memo(VoterChip);
