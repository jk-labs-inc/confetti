import { Avatar } from "@components/UI/Avatar";
import MedalAvatar from "@components/UI/MedalAvatar";
import PnlPill from "@components/UI/PnlPill";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import VoterName from "../../../FullBoard/components/VoterName";
import { ME_HIGHLIGHT_CLASS_NAME } from "../../../FullBoard/constants";
import { PODIUM_CARD_MIN_WIDTH_PX, STRIP_AVATAR_PX, STRIP_CHIP_PX, STRIP_MEDAL_ROW_HEIGHT_PX } from "../../constants";

interface PodiumCardProps {
  row: LeaderboardRow;
  formatPrice: NativePriceFormatter;
}

const DEFAULT_FRAME_CLASS_NAME = "border border-neutral-4 bg-neutral-2";

const PodiumCard: FC<PodiumCardProps> = ({ row, formatPrice }) => {
  const { profileName, profileAvatar } = useProfileData(row.address, true);
  const rank = row.isOnBoard ? row.rank : undefined;

  return (
    <div
      className={`flex flex-1 basis-0 flex-col gap-1.5 rounded-[14px] px-3 py-2.5 ${row.isViewer ? ME_HIGHLIGHT_CLASS_NAME : DEFAULT_FRAME_CLASS_NAME}`}
      style={{ minWidth: PODIUM_CARD_MIN_WIDTH_PX }}
    >
      <div className="flex items-center gap-2" style={{ minHeight: STRIP_MEDAL_ROW_HEIGHT_PX }}>
        {rank !== undefined ? (
          <MedalAvatar
            rank={rank}
            avatarSrc={profileAvatar}
            address={row.address}
            avatarPx={STRIP_AVATAR_PX}
            chipPx={STRIP_CHIP_PX}
          />
        ) : (
          <Avatar src={profileAvatar} address={row.address} sizePx={STRIP_AVATAR_PX} />
        )}
        <div className="min-w-0 flex-1">
          <VoterName
            row={row}
            profileName={profileName}
            meClassName="text-[12px] font-bold"
            linkClassName="w-fit max-w-full text-[12px] font-semibold"
          />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[17px] font-black tabular-nums text-neutral-11">{formatPrice(row.earningNative)}</span>
        {row.pnl && <PnlPill percentage={row.pnl.percentage} />}
      </div>
    </div>
  );
};

export default PodiumCard;
