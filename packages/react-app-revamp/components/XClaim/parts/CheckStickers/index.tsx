import { useXClaimBoard, type CheckStickerState, type CheckStickerStates } from "@components/XClaim/board";
import { checkLabel } from "@components/XClaim/copy";
import CheckIcon from "@components/XClaim/parts/CheckIcon";
import { X_CLAIM_CHECKS } from "lib/xClaim/constants";
import type { XAccountStats, XClaimCheck } from "lib/xClaim/types";
import { FC } from "react";

interface CheckStickersProps {
  states: CheckStickerStates;
  stats?: XAccountStats | null;
}

const TILT_CLASS: Readonly<Record<XClaimCheck, string>> = {
  verified: "-rotate-2",
  verifiedFollowers: "rotate-[1.5deg]",
  ratio: "-rotate-1",
};

const TODO_ICON_PATH: Readonly<Record<XClaimCheck, string>> = {
  verified: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M8 12l3 3 5-6",
  verifiedFollowers:
    "M5.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-3.5-5.4",
  ratio: "M12 4v16M6 20h12M5 8h14M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z",
};

const LAYOUT_CLASS = {
  sheet: { row: "gap-2", pill: "gap-1.5 text-[14px]", padded: "px-3 py-2", bordered: "px-[11px] py-[7px]", icon: 14 },
  modal: { row: "gap-2.5", pill: "gap-2 text-[15px]", padded: "px-4 py-2.5", bordered: "px-[15px] py-[9px]", icon: 16 },
} as const;

const isBordered = (state: CheckStickerState) => state === "running" || state === "queued";

const surfaceClass = (state: CheckStickerState) => {
  if (state === "running") return "border border-primary-3 bg-neutral-2 text-neutral-11";
  if (state === "queued") return "border border-dashed border-primary-3 text-neutral-9";
  return "bg-neutral-2 text-neutral-11";
};

const CheckStickers: FC<CheckStickersProps> = ({ states, stats = null }) => {
  const { layout } = useXClaimBoard();
  const sizes = LAYOUT_CLASS[layout];

  return (
    <div className={`flex flex-wrap justify-center py-0.5 ${sizes.row}`}>
      {X_CLAIM_CHECKS.map(check => {
        const state = states[check];
        return (
          <span
            key={check}
            data-check={check}
            data-state={state}
            className={`inline-flex items-center whitespace-nowrap rounded-full font-bold ${sizes.pill} ${
              isBordered(state) ? sizes.bordered : sizes.padded
            } ${surfaceClass(state)} ${TILT_CLASS[check]}`}
          >
            {state === "passed" && <CheckIcon size={sizes.icon} />}
            {state === "failed" && (
              <svg
                width={sizes.icon}
                height={sizes.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                aria-hidden="true"
                className="text-negative-11"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            )}
            {state === "running" && (
              <svg
                width={sizes.icon}
                height={sizes.icon}
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="3"
                aria-hidden="true"
                className="animate-spin"
              >
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" className="stroke-primary-3" />
                <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" className="stroke-neutral-11" />
              </svg>
            )}
            {(state === "todo" || state === "unknown" || state === "off") && (
              <svg
                width={sizes.icon}
                height={sizes.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-neutral-9"
              >
                <path d={TODO_ICON_PATH[check]} />
              </svg>
            )}
            {checkLabel({ check, failed: state === "failed", stats })}
          </span>
        );
      })}
    </div>
  );
};

export default CheckStickers;
