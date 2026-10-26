export const POT_WIDTH_PX = 176;
export const POT_HEIGHT_PX = 84;
export const POT_RIM = { cx: 88, cy: 16, rx: 80, ry: 9 };

const RIM_LEFT_X = POT_RIM.cx - POT_RIM.rx;
const RIM_RIGHT_X = POT_RIM.cx + POT_RIM.rx;
const LIP_ARC = `A${POT_RIM.rx},${POT_RIM.ry} 0 0 1 ${RIM_LEFT_X},${POT_RIM.cy}`;

export const POT_BODY_PATH = `M${RIM_LEFT_X},${POT_RIM.cy} C${RIM_LEFT_X},60 34,82 88,82 C142,82 ${RIM_RIGHT_X},60 ${RIM_RIGHT_X},${POT_RIM.cy} ${LIP_ARC} Z`;
export const POT_LIP_PATH = `M${RIM_RIGHT_X},${POT_RIM.cy} ${LIP_ARC}`;
export const POT_SHINE_PATH = "M20,32 C22,52 34,68 52,74";
export const POT_LABEL_TOP_PX = 28;
export const POT_LABEL_BOTTOM_PX = 10;

export interface PileItem {
  kind: "coin" | "bill";
  x: number;
  y: number;
  rotate: number;
}

export const PILE_LAYERS: readonly (readonly PileItem[])[] = [
  [
    { kind: "coin", x: 52, y: 21, rotate: 0 },
    { kind: "coin", x: 70, y: 23, rotate: 0 },
    { kind: "coin", x: 88, y: 24, rotate: 0 },
    { kind: "coin", x: 106, y: 23, rotate: 0 },
    { kind: "coin", x: 124, y: 21, rotate: 0 },
    { kind: "coin", x: 62, y: 18, rotate: 0 },
    { kind: "coin", x: 114, y: 18, rotate: 0 },
  ],
  [
    { kind: "bill", x: 92, y: 14, rotate: -10 },
    { kind: "coin", x: 72, y: 15, rotate: 0 },
    { kind: "coin", x: 88, y: 17, rotate: 0 },
    { kind: "coin", x: 106, y: 15, rotate: 0 },
  ],
  [
    { kind: "bill", x: 128, y: 10, rotate: 22 },
    { kind: "coin", x: 80, y: 11, rotate: 0 },
    { kind: "coin", x: 98, y: 11, rotate: 0 },
  ],
  [
    { kind: "bill", x: 56, y: 9, rotate: -24 },
    { kind: "coin", x: 90, y: 6, rotate: 0 },
    { kind: "coin", x: 76, y: 7, rotate: 0 },
    { kind: "coin", x: 104, y: 7, rotate: 0 },
  ],
];

export const PILE_STAGGER_S = 0.05;
export const PILE_DROP_PX = 22;
export const PILE_LIFT_PX = 12;
export const PILE_LEAVE_S = 0.25;

export interface PileLayerTiming {
  landAt: number | null;
  leaveAt: number | null;
}
