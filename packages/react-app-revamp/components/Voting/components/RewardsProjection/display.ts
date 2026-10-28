import type { DisplayPriceOptions } from "@hooks/useCurrency/useDisplayPrice";
import type { EntryProjection } from "@hooks/useVoteProjections";

interface EntryPriceInput {
  value: string;
  options?: DisplayPriceOptions;
}

export const entryPriceInput = (entry: EntryProjection | null): EntryPriceInput => {
  if (entry === null) return { value: "0" };
  switch (entry.kind) {
    case "pushToFirst":
      return { value: entry.remainingToFirst, options: { ceilingPrecision: true } };
    case "wouldWinNow":
      return { value: entry.amount, options: {} };
    default: {
      const _exhaustive: never = entry;
      return _exhaustive;
    }
  }
};
