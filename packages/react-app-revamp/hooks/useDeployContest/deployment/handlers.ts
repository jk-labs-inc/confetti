import { toastSuccess } from "@components/UI/Toast";

export const updateDeploymentStore = (
  setDeployContestData: (
    chainName: string,
    chainId: number,
    hash: `0x${string}`,
    contractAddress: string,
    sortingEnabled: boolean,
  ) => void,
  contractDeploymentHash: `0x${string}`,
  contractAddress: string,
  sortingEnabled: boolean,
  chainName: string,
  chainId: number,
) => {
  setDeployContestData(chainName, chainId, contractDeploymentHash, contractAddress, sortingEnabled);
};

export const handleDeploymentSuccess = (
  setIsSuccess: (value: boolean) => void,
  setIsLoading: (value: boolean) => void,
) => {
  toastSuccess({
    message: "contest has been deployed!",
  });
  setIsSuccess(true);
  setIsLoading(false);
};

export const handleDeploymentError = (
  error: unknown,
  handleError: (error: unknown, message: string) => void,
  setIsLoading: (value: boolean) => void,
) => {
  console.error("Failed to deploy contest:", error);
  handleError(error, "Something went wrong and the contest couldn't be deployed.");
  setIsLoading(false);
};
