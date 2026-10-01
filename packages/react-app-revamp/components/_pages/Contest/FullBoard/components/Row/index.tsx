import { Avatar } from "@components/UI/Avatar";
import PnlPill from "@components/UI/PnlPill";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { BOARD_AVATAR_PX, BOARD_ROW_GRID_CLASS_NAME, ME_HIGHLIGHT_CLASS_NAME, UNRANKED_LABEL } from "../../constants";
import VoterName from "../VoterName";

interface BoardRowProps {
  row: LeaderboardRow;
  formatPrice: NativePriceFormatter;
}

const BoardRow: FC<BoardRowProps> = ({ row, formatPrice }) => {
  const { profileName, profileAvatar } = useProfileData(row.address, true);
  const frameClassName = row.isViewer ? `rounded-xl ${ME_HIGHLIGHT_CLASS_NAME}` : "border-b border-neutral-4";

  return (
    <div className={`${BOARD_ROW_GRID_CLASS_NAME} ${frameClassName} px-2 py-[9px]`}>
      <span className="text-center text-[14px] font-bold leading-tight tabular-nums text-neutral-11">
        {row.isOnBoard ? row.rank : UNRANKED_LABEL}
      </span>
      <Avatar src={profileAvatar} address={row.address} sizePx={BOARD_AVATAR_PX} />
      <div className="min-w-0 leading-tight">
        <VoterName
          row={row}
          profileName={profileName}
          meClassName="text-[13px] font-bold"
          linkClassName="text-[13px] font-semibold"
        />
      </div>
      <span className="text-right text-[16px] font-black tabular-nums text-neutral-11">
        {formatPrice(row.earningNative)}
      </span>
      <div className="flex justify-end">
        <PnlPill percentage={row.pnl?.percentage ?? null} />
      </div>
    </div>
  );
};

export default BoardRow;
