import { Avatar } from "@components/UI/Avatar";
import MedalAvatar from "@components/UI/MedalAvatar";
import PnlPill from "@components/UI/PnlPill";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import VoterName from "../../../FullBoard/components/VoterName";
import { ME_HIGHLIGHT_CLASS_NAME } from "../../../FullBoard/constants";
import { RAIL_AVATAR_PX, RAIL_CHIP_PX, RAIL_MEDAL_CELL_PX } from "../../constants";

interface RailBoardRowProps {
  row: LeaderboardRow;
  formatPrice: NativePriceFormatter;
}

const DEFAULT_FRAME_CLASS_NAME = "border-b border-neutral-4 last:border-b-0 px-0.5";
const VIEWER_FRAME_CLASS_NAME = `rounded-xl px-2 not-first:mt-1.5 not-last:mb-1.5 ${ME_HIGHLIGHT_CLASS_NAME}`;

const RailBoardRow: FC<RailBoardRowProps> = ({ row, formatPrice }) => {
  const { profileName, profileAvatar } = useProfileData(row.address, true);

  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-1 ${
        row.isViewer ? VIEWER_FRAME_CLASS_NAME : DEFAULT_FRAME_CLASS_NAME
      }`}
    >
      <div className="flex justify-center" style={{ width: RAIL_MEDAL_CELL_PX }}>
        {row.isOnBoard ? (
          <MedalAvatar
            rank={row.rank}
            avatarSrc={profileAvatar}
            address={row.address}
            avatarPx={RAIL_AVATAR_PX}
            chipPx={RAIL_CHIP_PX}
          />
        ) : (
          <Avatar src={profileAvatar} address={row.address} sizePx={RAIL_AVATAR_PX} />
        )}
      </div>
      <div className="min-w-0 leading-tight">
        <VoterName
          row={row}
          profileName={profileName}
          meClassName="text-[12px] font-bold"
          linkClassName="w-fit max-w-full text-[12px] font-bold"
        />
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[13px] font-black leading-none tabular-nums text-neutral-11">
          {formatPrice(row.earningNative)}
        </span>
        {row.pnl && <PnlPill percentage={row.pnl.percentage} />}
      </div>
    </div>
  );
};

export default RailBoardRow;
