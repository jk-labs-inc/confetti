import EntryRankMedal from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { PositionedVote } from "@components/PriceCurve/components/Voters/types";
import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { formatTimeAgo } from "@helpers/dates";
import { formatVoteCount } from "@helpers/formatNumber";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useNow from "@hooks/useNow";
import useProfileData from "@hooks/useProfileData";
import { FC, memo, useEffect, useState } from "react";
import { ACTIVITY_AVATAR_PX, ACTIVITY_ROW_HEIGHT_PX } from "./constants";

interface ActivityRowProps {
  vote: PositionedVote;
  rank?: number;
  entryTitle?: string;
  formatPrice: NativePriceFormatter;
  isNew: boolean;
  onSeen: (uuid: string) => void;
}

const ActivityRow: FC<ActivityRowProps> = ({ vote, rank, entryTitle, formatPrice, isNew, onSeen }) => {
  const { profileName, profileAvatar } = useProfileData(vote.userAddress, true);
  const now = useNow();
  const [entering] = useState(isNew);
  const votesText = `+${formatVoteCount(vote.voteAmount)}`;
  const hasPrice = vote.amountSent !== null;

  useEffect(() => {
    if (entering) onSeen(vote.uuid);
  }, [entering, vote.uuid, onSeen]);

  return (
    <div
      className={`grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-neutral-4 ${
        entering ? "voter-chip-enter" : ""
      }`}
      style={{ height: ACTIVITY_ROW_HEIGHT_PX }}
    >
      <Avatar src={profileAvatar} address={vote.userAddress} sizePx={ACTIVITY_AVATAR_PX} className="shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <CustomLink
            href={ROUTE_VIEW_USER.replace("[address]", vote.userAddress)}
            target="_blank"
            className="truncate text-[12.5px] font-bold normal-case text-neutral-11 no-underline hover:underline"
          >
            {profileName}
          </CustomLink>
          <span className="shrink-0 text-[11px] text-neutral-9">{formatTimeAgo(vote.createdAt, now)}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-[11.5px]">
          <span className="shrink-0 text-neutral-9">backed</span>
          <EntryRankMedal rank={rank} />
          <span className={`truncate font-semibold ${entryTitle ? "text-neutral-11" : "text-neutral-9"}`}>
            {entryTitle ?? "an entry"}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 whitespace-nowrap tabular-nums">
        <span className="text-[13px] font-bold text-neutral-11">
          {hasPrice ? formatPrice(vote.totalCost) : votesText}
        </span>
        {hasPrice && <span className="text-[11px] text-neutral-9">{votesText}</span>}
      </div>
    </div>
  );
};

export default memo(ActivityRow);
