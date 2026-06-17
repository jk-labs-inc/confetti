const ENTRY_PALETTE = [
  "#bb65ff", // secondary-11 · violet
  "#66deff", // positive-18 · cyan
  "#78ffc6", // positive-11 · mint
  "#ffe25b", // primary-10 · yellow
  "#ff78a9", // negative-11 · pink
  "#e93d82", // negative-9 · rose
] as const;

export const NEUTRAL_ENTRY_COLOR = "#9d9d9d";

export function buildEntryColors(proposalIds: Iterable<string>): Map<string, string> {
  const unique = Array.from(new Set(proposalIds)).sort();
  const colors = new Map<string, string>();
  unique.forEach((id, index) => colors.set(id, ENTRY_PALETTE[index % ENTRY_PALETTE.length]));
  return colors;
}
