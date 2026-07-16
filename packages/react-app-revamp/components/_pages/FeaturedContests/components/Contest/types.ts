export type CardState = "upcoming" | "live" | "ended" | "canceled";

export interface CardEntry {
  id: string;
  votes: number | null;
  percent: number | null;
  isTitlePending: boolean;
  title?: string;
  image?: string;
}

export type ContestTimingFormat = "countdown" | "upcoming" | "ended" | "canceled";

export interface ContestTimingData {
  format: ContestTimingFormat;
  display: string;
}
