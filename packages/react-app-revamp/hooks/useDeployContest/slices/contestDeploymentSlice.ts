import { StepTitle, getStepNumber } from "@components/_pages/Create/types";

type ContestDeployError = {
  step: number;
  message: string;
};

export interface DeploymentSliceState {
  deployContestData: {
    chain: string;
    chainId: number;
    hash: string;
    address: string;
    sortingEnabled: boolean;
  };
  isLoading: boolean;
  isSuccess: boolean;
  errors: ContestDeployError[];
  step: number;
}

export interface DeploymentSliceActions {
  setDeployContestData: (
    chain: string,
    chainId: number,
    hash: string,
    address: string,
    sortingEnabled: boolean,
  ) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (step: StepTitle | number, error: ContestDeployError) => void;
  setStep: (step: number) => void;
}

export type DeploymentSlice = DeploymentSliceState & DeploymentSliceActions;

export const createDeploymentSlice = (set: any, get: any): DeploymentSlice => {
  const initialState = {
    deployContestData: {
      chain: "",
      chainId: 0,
      hash: "",
      address: "",
      sortingEnabled: false,
    },
    isLoading: false,
    isSuccess: false,
    errors: [],
    step: 0,
  };

  return {
    ...initialState,

    setDeployContestData: (chain: string, chainId: number, hash: string, address: string, sortingEnabled: boolean) =>
      set({ deployContestData: { chain, chainId, hash, address, sortingEnabled } }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setIsSuccess: (isSuccess: boolean) => set({ isSuccess }),
    setError: (step: StepTitle | number, error: ContestDeployError) => {
      const stepNumber = typeof step === "number" ? step : getStepNumber(step);
      let errorsCopy = [...get().errors];
      errorsCopy = errorsCopy.filter((e: ContestDeployError) => e.step !== stepNumber);
      if (error.message) {
        errorsCopy.push({ ...error, step: stepNumber });
      }
      set({ errors: errorsCopy });
    },
    setStep: (step: number) => set({ step }),
  };
};
