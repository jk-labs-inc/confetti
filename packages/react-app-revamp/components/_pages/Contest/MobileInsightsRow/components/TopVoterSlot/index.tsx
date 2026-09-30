import { Avatar } from "@components/UI/Avatar";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";

const TOP_VOTER_AVATAR_PX = 22;
const TOP_VOTER_RING_PX = 1.5;
const TOP_VOTER_RING_COLORS: Record<number, string> = {
  1: "#f0c000",
  2: "#cdcdcd",
  3: "#c8814a",
};

interface TopVoterSlotProps {
  row: LeaderboardRow;
  formatPrice: NativePriceFormatter;
}

const TopVoterSlot: FC<TopVoterSlotProps> = ({ row, formatPrice }) => {
  const { profileAvatar } = useProfileData(row.address, true);
  const ringColor = TOP_VOTER_RING_COLORS[row.rank];

  return (
    <span className="flex h-full shrink-0 items-center gap-1.5">
      <span
        className="shrink-0 rounded-full"
        style={ringColor ? { boxShadow: `0 0 0 ${TOP_VOTER_RING_PX}px ${ringColor}` } : undefined}
      >
        <Avatar src={profileAvatar} address={row.address} sizePx={TOP_VOTER_AVATAR_PX} />
      </span>
      <span className="text-[12.5px] font-bold tabular-nums text-neutral-11">{formatPrice(row.earningNative)}</span>
    </span>
  );
};

export default TopVoterSlot;
