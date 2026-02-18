// https://github.com/pmndrs/zustand/discussions/821#discussioncomment-8548182
import { useFundPoolStore } from "@components/_pages/Create/pages/ContestRewards/components/FundPool/store";

type ReactStyleStateSetter<T> = T | ((prev: T) => T);

interface ActionState {
  loading: boolean;
  error: boolean;
  success: boolean;
}

export interface Recipient {
  id: number;
  place: number;
  proportion: number | null;
}

export interface ValidationError {
  uniqueRanks?: string;
  zeroProportion?: string;
  invalidTotal?: string;
  duplicateRank?: string;
}

export interface RewardPoolData {
  rankings: number[];
  shareAllocations: number[];
  recipients: Recipient[];
  validationError: ValidationError;
  deploy: ActionState;
  attach: ActionState;
  // this one is used for funding the pool state
  [key: string]: any;
}

export interface CreateRewardsSliceState {
  rewardPoolData: RewardPoolData;
  addFundsToRewards: boolean;
}

export interface CreateRewardsSliceActions {
  setRewardPoolData: (data: ReactStyleStateSetter<RewardPoolData>) => void;
  setAddFundsToRewards: (addFundsToRewards: boolean) => void;
  validateRewards: () => { isValid: boolean; error: string | null };
  reset: () => void;
}

export type CreateRewardsSlice = CreateRewardsSliceState & CreateRewardsSliceActions;

const recipients: Recipient[] = [{ id: 0, place: 1, proportion: 100 }];

function getInitialRewardPoolData(): RewardPoolData {
  return {
    rankings: recipients.map(r => r.place),
    shareAllocations: recipients.map(r => r.proportion ?? 0),
    recipients: recipients,
    validationError: {
      uniqueRanks: undefined,
      zeroProportion: undefined,
      invalidTotal: undefined,
      duplicateRank: undefined,
    },
    deploy: {
      loading: false,
      error: false,
      success: false,
    },
    attach: {
      loading: false,
      error: false,
      success: false,
    },
  };
}

export const createCreateRewardsSlice = (set: any, get: any): CreateRewardsSlice => ({
  rewardPoolData: getInitialRewardPoolData(),
  addFundsToRewards: false,

  setRewardPoolData: data =>
    set((state: any) => ({
      rewardPoolData: typeof data === "function" ? data(state.rewardPoolData) : data,
    })),

  setAddFundsToRewards: addFundsToRewards => set({ addFundsToRewards }),

  validateRewards: () => {
    const state = get();
    const { recipients } = state.rewardPoolData;
    const { addFundsToRewards } = state;

    if (recipients.length === 0) {
      return {
        isValid: false,
        error: "At least one recipient is required",
      };
    }

    const totalProportion = recipients.reduce(
      (sum: number, recipient: Recipient) => sum + (recipient.proportion ?? 0),
      0,
    );

    if (totalProportion !== 100) {
      return {
        isValid: false,
        error: `Total proportion must equal 100%, currently ${totalProportion}%`,
      };
    }

    if (addFundsToRewards) {
      const { tokenWidgets, isError } = useFundPoolStore.getState();

      if (isError) {
        return {
          isValid: false,
          error: "There is an error with the token widgets",
        };
      }

      if (tokenWidgets.length === 0) {
        return {
          isValid: false,
          error: "At least one token widget is required when funding rewards",
        };
      }

      const uniqueAddresses = new Set(tokenWidgets.map(token => token.address));
      if (tokenWidgets.length !== uniqueAddresses.size) {
        return {
          isValid: false,
          error: "All tokens must be unique",
        };
      }

      const hasZeroAmountToken = tokenWidgets.some(token => token.amount === "0" || token.amount === "");
      if (hasZeroAmountToken) {
        return {
          isValid: false,
          error: "Token amounts cannot be zero or empty",
        };
      }
    }

    return {
      isValid: true,
      error: null,
    };
  },

  reset: () =>
    set({
      rewardPoolData: getInitialRewardPoolData(),
      addFundsToRewards: false,
    }),
});
