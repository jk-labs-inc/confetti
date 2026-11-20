import { toastSuccess } from "@components/UI/Toast";
import { TransactionGasCapExceededError } from "./gas";

const DEPLOYMENT_FAILED_MESSAGE = "Something went wrong and the contest couldn't be deployed.";
const GAS_CAP_EXCEEDED_MESSAGE =
  "This contest needs more gas than the network allows. Shorten the description and try again.";

export const updateDeploymentStore = (
  setDeployContestData: (chainName: string, chainId: number, hash: `0x${string}`, contractAddress: string) => void,
  contractDeploymentHash: `0x${string}`,
  contractAddress: string,
  chainName: string,
  chainId: number,
) => {
  setDeployContestData(chainName, chainId, contractDeploymentHash, contractAddress);
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
  handleError(
    error,
    error instanceof TransactionGasCapExceededError ? GAS_CAP_EXCEEDED_MESSAGE : DEPLOYMENT_FAILED_MESSAGE,
  );
  setIsLoading(false);
};
