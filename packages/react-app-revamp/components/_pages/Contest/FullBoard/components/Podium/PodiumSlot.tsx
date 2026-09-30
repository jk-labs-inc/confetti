import MedalAvatar from "@components/UI/MedalAvatar";
import PnlPill from "@components/UI/PnlPill";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { PodiumPlace, PodiumSize, ROW_MEDAL_PX } from "../../constants";
import MainEntryLine from "../MainEntryLine";
import VoterName from "../VoterName";
import PodiumPedestal from "./PodiumPedestal";
import { PODIUM_SLOT_STYLE } from "./constants";

interface PodiumSlotProps {
  place: PodiumPlace;
  row: LeaderboardRow;
  entryTitle?: string;
  formatPrice: NativePriceFormatter;
  size?: PodiumSize;
}

const PodiumSlot: FC<PodiumSlotProps> = ({ place, row, entryTitle, formatPrice, size = "board" }) => {
  const { profileName, profileAvatar } = useProfileData(row.address, true);
  const style = PODIUM_SLOT_STYLE[size][place];

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <MedalAvatar
        rank={place}
        avatarSrc={profileAvatar}
        address={row.address}
        avatarPx={style.avatarPx}
        chipPx={style.chipPx}
      />
      <VoterName
        row={row}
        profileName={profileName}
        meClassName={style.name}
        linkClassName={`max-w-full ${style.name}`}
      />
      <div className="flex items-baseline gap-1.5">
        <span className={`font-black tabular-nums text-neutral-11 ${style.payout}`}>
          {formatPrice(row.earningNative)}
        </span>
        {row.pnl && <PnlPill percentage={row.pnl.percentage} />}
      </div>
      {row.mainEntry && (
        <MainEntryLine
          mainEntry={row.mainEntry}
          entryTitle={entryTitle}
          medalPx={ROW_MEDAL_PX}
          className="max-w-full text-[10px]"
        />
      )}
      <PodiumPedestal place={place} size={size} />
    </div>
  );
};

export default PodiumSlot;
