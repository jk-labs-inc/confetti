import { CSSProperties } from "react";

export const ENTRY_CARD_GROUP_CLASS_NAME = "group/entry";

export const ENTRY_CARD_FRAME_CLASS_NAME =
  "bg-true-black rounded-2xl border border-white/10 transition-[border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] lg:group-data-selectable/entry:group-hover/entry:border-white/30";

export const entryCardFrameStyle = (highlightColor?: string): CSSProperties | undefined =>
  highlightColor ? { borderColor: highlightColor, boxShadow: `0 0 0 1px ${highlightColor}` } : undefined;
