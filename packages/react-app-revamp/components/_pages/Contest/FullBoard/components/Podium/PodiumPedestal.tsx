import { FC } from "react";
import { PodiumPlace, PodiumSize } from "../../constants";

interface PodiumPedestalProps {
  place: PodiumPlace;
  size?: PodiumSize;
  isEmpty?: boolean;
}

const PEDESTAL_CLASS_NAME: Record<PodiumSize, Record<PodiumPlace, string>> = {
  board: {
    1: "h-14 bg-neutral-3 border-white/14 text-[22px] text-primary-10",
    2: "h-10 bg-neutral-2 border-neutral-4 text-[18px] text-neutral-12",
    3: "h-[30px] bg-neutral-2 border-neutral-4 text-[16px] text-neutral-12",
  },
  sheet: {
    1: "h-8 bg-neutral-3 border-white/14 text-[16px] text-primary-10",
    2: "h-[22px] bg-neutral-2 border-neutral-4 text-[12px] text-neutral-12",
    3: "h-4 bg-neutral-2 border-neutral-4 text-[10px] text-neutral-12",
  },
};

const EMPTY_PEDESTAL_CLASS_NAME = "border-dashed opacity-60";

const PodiumPedestal: FC<PodiumPedestalProps> = ({ place, size = "board", isEmpty = false }) => (
  <div
    className={`flex w-full items-center justify-center rounded-t-xl border border-b-0 font-sabo-filled ${
      PEDESTAL_CLASS_NAME[size][place]
    } ${isEmpty ? EMPTY_PEDESTAL_CLASS_NAME : ""}`}
  >
    {place}
  </div>
);

export default PodiumPedestal;
