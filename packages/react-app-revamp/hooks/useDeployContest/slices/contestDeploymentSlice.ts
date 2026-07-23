export interface DeploymentSliceState {
  deployContestData: {
    chain: string;
    chainId: number;
    hash: string;
    address: string;
  };
  isLoading: boolean;
  isSuccess: boolean;
}

export interface DeploymentSliceActions {
  setDeployContestData: (chain: string, chainId: number, hash: string, address: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
}

export type DeploymentSlice = DeploymentSliceState & DeploymentSliceActions;

export const createDeploymentSlice = (set: any, get: any): DeploymentSlice => ({
  deployContestData: {
    chain: "",
    chainId: 0,
    hash: "",
    address: "",
  },
  isLoading: false,
  isSuccess: false,

  setDeployContestData: (chain: string, chainId: number, hash: string, address: string) =>
    set({ deployContestData: { chain, chainId, hash, address } }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsSuccess: (isSuccess: boolean) => set({ isSuccess }),
});
