/* eslint-disable @next/next/no-img-element */
import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import type { DemoEntry } from "lib/howItWorks/demo";
import { CSSProperties, FC } from "react";

interface EntryCardProps {
  entry: DemoEntry;
  rank?: number;
  isDimmed?: boolean;
  isHighlighted?: boolean;
  style?: CSSProperties;
  "data-actor"?: string;
  "data-index"?: number;
}

export const ENTRY_CARD_SIZE_PX = 88;
const ENTRY_CARD_GAP_PX = 14;
const ENTRY_ROW_SIZE = 3;
const ENTRY_ROW_LEFT_PX =
  (STAGE_WIDTH_PX - ENTRY_ROW_SIZE * ENTRY_CARD_SIZE_PX - (ENTRY_ROW_SIZE - 1) * ENTRY_CARD_GAP_PX) / 2;
const HIGHLIGHT_COLOR = "var(--color-primary-10)";

export const entryRowLeft = (index: number) => ENTRY_ROW_LEFT_PX + index * (ENTRY_CARD_SIZE_PX + ENTRY_CARD_GAP_PX);

const nameOverlayStyle: CSSProperties = {
  color: "#E5E5E5",
  textShadow: "1px 1px 0 #000",
  background: "linear-gradient(0deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.40) 50%, rgba(0, 0, 0, 0.00) 100%)",
};

const EntryCard: FC<EntryCardProps> = ({ entry, rank, isDimmed, isHighlighted, style, ...actor }) => {
  const medalSrc = rank ? MEDAL_IMAGES[rank] : undefined;

  return (
    <div
      {...actor}
      style={{
        width: ENTRY_CARD_SIZE_PX,
        height: ENTRY_CARD_SIZE_PX,
        ...(isHighlighted ? { borderColor: HIGHLIGHT_COLOR, boxShadow: `0 0 0 1px ${HIGHLIGHT_COLOR}` } : undefined),
        ...style,
      }}
      className={`absolute rounded-[14px] border border-white/10 bg-true-black p-1 transition-opacity ${
        isDimmed ? "opacity-40" : ""
      }`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[10px]">
        <img src={entry.photoSrc} alt="" draggable={false} className="h-full w-full object-cover" />
        {medalSrc && <img src={medalSrc} alt="" className="absolute left-0.5 top-0.5 size-6 object-contain" />}
        <p
          style={nameOverlayStyle}
          className="absolute inset-x-0 bottom-0 pb-1 pt-4 text-center text-[11px] font-bold leading-none"
        >
          {entry.name}
        </p>
      </div>
    </div>
  );
};

export default EntryCard;
