export const FIRST_PLACE_ENTRY_COLOR = "#bb65ff";

export const withAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/(.)/g, "$1$1") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface EntryMedalStop {
  offset: string;
  color: string;
}

export interface EntryMedal {
  background: string;
  solid: string;
  isGradient: boolean;
  stops: readonly EntryMedalStop[];
}

const gradient = (solid: string, mid: string): string =>
  `linear-gradient(180deg, ${solid} 33.75%, ${mid} 49.37%, ${solid} 65%)`;

const medal = (solid: string, mid: string): EntryMedal => ({
  background: gradient(solid, mid),
  solid,
  isGradient: true,
  stops: [
    { offset: "33.75%", color: solid },
    { offset: "49.37%", color: mid },
    { offset: "65%", color: solid },
  ],
});

const GOLD = medal("#FFE25B", "#FFF6CB");
const SILVER = medal("#CCD4DE", "#FFFFFF");
const BRONZE = medal("#CD7F32", "#F5BB74");
const OTHER = medal("#9D9D9D", "#E5E5E5");

const UNRANKED: EntryMedal = {
  background: FIRST_PLACE_ENTRY_COLOR,
  solid: FIRST_PLACE_ENTRY_COLOR,
  isGradient: false,
  stops: [
    { offset: "0%", color: FIRST_PLACE_ENTRY_COLOR },
    { offset: "100%", color: FIRST_PLACE_ENTRY_COLOR },
  ],
};

export function entryMedal(rank: number | undefined | null): EntryMedal {
  if (!rank) return UNRANKED;
  if (rank === 1) return GOLD;
  if (rank === 2) return SILVER;
  if (rank === 3) return BRONZE;
  return OTHER;
}
