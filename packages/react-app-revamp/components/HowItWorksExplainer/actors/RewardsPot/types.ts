export interface PileItem {
  kind: "coin" | "bill";
  x: number;
  y: number;
  rotate: number;
}

export interface PileLayerTiming {
  landAt: number | null;
  leaveAt: number | null;
}
