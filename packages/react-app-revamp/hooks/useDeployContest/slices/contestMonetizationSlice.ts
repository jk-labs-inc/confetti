import { CREATOR_SPLIT_ENABLED_DEFAULT, PERCENTAGE_TO_REWARDS_DEFAULT } from "constants/monetization";
import { Charge, PriceCurve, PriceCurveType } from "../types";

type ReactStyleStateSetter<T> = T | ((prev: T) => T);

export const DEFAULT_MULTIPLER_EXPONENTIAL = 10;
export const DEFAULT_MULTIPLER_LOGARITHMIC = 10;

export const MULTIPLIER_RANGES: Record<PriceCurveType, { min: number; max: number }> = {
  [PriceCurveType.Exponential]: { min: 8, max: 20 },
  [PriceCurveType.Logarithmic]: { min: 8, max: 20 },
};

export const DEFAULT_MULTIPLIERS: Record<PriceCurveType, number> = {
  [PriceCurveType.Exponential]: DEFAULT_MULTIPLER_EXPONENTIAL,
  [PriceCurveType.Logarithmic]: DEFAULT_MULTIPLER_LOGARITHMIC,
};

export interface MonetizationSliceState {
  charge: Charge;
  prevChainRefInCharge: string;
  priceCurve: PriceCurve;
}

export interface MonetizationSliceActions {
  setCharge: (charge: ReactStyleStateSetter<Charge>) => void;
  setPrevChainRefInCharge: (chain: string) => void;
  setPriceCurve: (priceCurve: ReactStyleStateSetter<PriceCurve>) => void;
}

export type MonetizationSlice = MonetizationSliceState & MonetizationSliceActions;

export const createMonetizationSlice = (set: any): MonetizationSlice => ({
  charge: {
    percentageToRewards: PERCENTAGE_TO_REWARDS_DEFAULT,
    creatorSplitEnabled: CREATOR_SPLIT_ENABLED_DEFAULT,
    costToVote: 0,
    costToVoteEndPrice: 0,
    error: false,
  },
  prevChainRefInCharge: "",
  priceCurve: {
    multiple: 1,
    multipler: DEFAULT_MULTIPLER_EXPONENTIAL,
    type: PriceCurveType.Exponential,
  },

  setCharge: (charge: ReactStyleStateSetter<Charge>) =>
    set((state: any) => ({
      charge: typeof charge === "function" ? charge(state.charge) : charge,
    })),
  setPrevChainRefInCharge: (chain: string) => set({ prevChainRefInCharge: chain }),
  setPriceCurve: (priceCurve: ReactStyleStateSetter<PriceCurve>) =>
    set((state: any) => ({
      priceCurve: typeof priceCurve === "function" ? priceCurve(state.priceCurve) : priceCurve,
    })),
});
