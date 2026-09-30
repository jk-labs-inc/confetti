export type PriceCurveHeaderTone = "muted" | "bright";

interface PriceCurveHeaderToneClassNames {
  priceLine: string;
  amount: string;
  interval: string;
}

export const HEADER_TONE_CLASS_NAMES: Record<PriceCurveHeaderTone, PriceCurveHeaderToneClassNames> = {
  muted: {
    priceLine: "text-[16px] text-neutral-9 tracking-wide",
    amount: "",
    interval: "text-[12px] text-neutral-9 mt-0.5",
  },
  bright: {
    priceLine: "text-[16px] text-neutral-11 tracking-wide",
    amount: "font-bold",
    interval: "text-[12px] text-neutral-9 mt-0.5",
  },
};
