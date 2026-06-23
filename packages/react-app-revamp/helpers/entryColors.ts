// Each contest entry gets a dedicated color used everywhere it appears: the price-curve
// voter ribbon + on-curve marker, and the selected proposal card's border.

export const FIRST_PLACE_ENTRY_COLOR = "#bb65ff";

export const NEUTRAL_ENTRY_COLOR = "#9d9d9d";

export const colorOf = (colors: Map<string, string>, proposalId: string): string =>
  colors.get(proposalId) ?? NEUTRAL_ENTRY_COLOR;

export const withAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/(.)/g, "$1$1") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ENTRY_PALETTE = [
  "#66deff", // positive-18 · cyan
  "#78ffc6", // positive-11 · mint
  "#ffe25b", // primary-10 · yellow
  "#ff78a9", // negative-11 · pink
  "#e93d82", // negative-9 · rose
] as const;

const hashString = (s: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** The dedicated color for a single entry. */
export function entryColor(proposalId: string, isLeader: boolean): string {
  if (isLeader) return FIRST_PLACE_ENTRY_COLOR;
  return ENTRY_PALETTE[hashString(proposalId) % ENTRY_PALETTE.length];
}

/** proposalId → color map, with the given leader pinned to the first-place color. */
export function buildEntryColors(
  proposalIds: Iterable<string>,
  leadingProposalId?: string | null,
): Map<string, string> {
  const colors = new Map<string, string>();
  for (const id of new Set(proposalIds)) {
    colors.set(id, entryColor(id, !!leadingProposalId && id === leadingProposalId));
  }
  return colors;
}
