import { PodiumPlace, PodiumSize } from "../../constants";

interface SlotStyle {
  avatarPx: number;
  chipPx: number;
  name: string;
  payout: string;
}

interface EmptySeatCopy {
  title: string;
  hint: string;
}

export const PODIUM_SLOT_STYLE: Record<PodiumSize, Record<PodiumPlace, SlotStyle>> = {
  board: {
    1: { avatarPx: 60, chipPx: 18, name: "text-[14px] font-bold", payout: "text-[26px]" },
    2: { avatarPx: 48, chipPx: 16, name: "text-[12px] font-semibold", payout: "text-[18px]" },
    3: { avatarPx: 48, chipPx: 16, name: "text-[12px] font-semibold", payout: "text-[18px]" },
  },
  sheet: {
    1: { avatarPx: 48, chipPx: 16, name: "text-[12px] font-bold", payout: "text-[20px]" },
    2: { avatarPx: 40, chipPx: 14, name: "text-[11px] font-semibold", payout: "text-[14px]" },
    3: { avatarPx: 40, chipPx: 14, name: "text-[11px] font-semibold", payout: "text-[14px]" },
  },
};

export const OPEN_SEAT_COPY: EmptySeatCopy = { title: "could be you", hint: "back an entry to claim it" };
export const OPEN_SEAT_VIEWER_SEATED_COPY: EmptySeatCopy = { title: "up for grabs", hint: "no voter here yet" };
export const UNCLAIMED_SEAT_COPY: EmptySeatCopy = { title: "unclaimed", hint: "nobody took this seat" };
