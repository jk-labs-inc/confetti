import EmptyMedalAvatar from "@components/UI/MedalAvatar/EmptyMedalAvatar";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC } from "react";
import { PodiumPlace, PodiumSize } from "../../constants";
import { OPEN_SEAT_COPY, OPEN_SEAT_VIEWER_SEATED_COPY, PODIUM_SLOT_STYLE, UNCLAIMED_SEAT_COPY } from "./constants";
import PodiumPedestal from "./PodiumPedestal";

interface PodiumEmptySlotProps {
  place: PodiumPlace;
  isViewerSeated: boolean;
  size?: PodiumSize;
}

const PodiumEmptySlot: FC<PodiumEmptySlotProps> = ({ place, isViewerSeated, size = "board" }) => {
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const style = PODIUM_SLOT_STYLE[size][place];
  const copy = !isVotingOpen ? UNCLAIMED_SEAT_COPY : isViewerSeated ? OPEN_SEAT_VIEWER_SEATED_COPY : OPEN_SEAT_COPY;

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <EmptyMedalAvatar rank={place} avatarPx={style.avatarPx} chipPx={style.chipPx} />
      <p className={`normal-case text-neutral-10 ${style.name}`}>{copy.title}</p>
      <p className="max-w-full text-[10px] normal-case text-neutral-9">{copy.hint}</p>
      <PodiumPedestal place={place} size={size} isEmpty />
    </div>
  );
};

export default PodiumEmptySlot;
