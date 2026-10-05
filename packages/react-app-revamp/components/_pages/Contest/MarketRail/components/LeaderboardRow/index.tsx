import { Avatar } from "@components/UI/Avatar";
import { LeaderboardRow as LeaderboardRowData } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import VoterName from "../../../FullBoard/components/VoterName";
import { ME_HIGHLIGHT_CLASS_NAME } from "../../../FullBoard/constants";
import { RAIL_ROW_GRID_CLASS_NAME } from "../../constants";
import EarningCell from "./EarningCell";
import RankCell from "./RankCell";

interface LeaderboardRowProps {
  row: LeaderboardRowData;
  formatPrice: NativePriceFormatter;
}

const LeaderboardRow: FC<LeaderboardRowProps> = ({ row, formatPrice }) => {
  const { profileName, profileAvatar } = useProfileData(row.address, true);
  const frameClassName = row.isViewer ? `rounded-xl ${ME_HIGHLIGHT_CLASS_NAME}` : "border-b border-neutral-4";

  return (
    <div className={`${RAIL_ROW_GRID_CLASS_NAME} ${frameClassName} px-2 py-1.5 wide:py-[7px]`}>
      <RankCell rank={row.isOnBoard ? row.rank : null} />
      <Avatar src={profileAvatar} address={row.address} size="extraSmall" className="shrink-0" />
      <div className="min-w-0 leading-tight">
        <VoterName
          row={row}
          profileName={profileName}
          meClassName="text-[11.5px] wide:text-[12px] font-bold"
          linkClassName="text-[11.5px] wide:text-[12px] font-bold"
        />
      </div>
      <EarningCell
        earningNative={row.earningNative}
        pnlPercentage={row.pnl?.percentage ?? null}
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default LeaderboardRow;
