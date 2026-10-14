import type { XClaimSpots } from "lib/xClaim/types";
import { FC } from "react";

interface SpotsLineProps {
  spots: XClaimSpots | null;
  placement?: "board" | "card";
}

const PLACEMENT_CLASS = {
  board: "text-center text-[14px]",
  card: "text-[13px]",
} as const;

const SpotsLine: FC<SpotsLineProps> = ({ spots, placement = "board" }) => {
  if (!spots) return null;

  return (
    <p className={`text-neutral-9 ${PLACEMENT_CLASS[placement]}`}>
      <b className="text-neutral-11">
        {spots.open} of {spots.dailyLimit}
      </b>{" "}
      spots left today
    </p>
  );
};

export default SpotsLine;
