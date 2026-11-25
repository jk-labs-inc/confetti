import { useWallet } from "@hooks/useWallet";

export const useIsDescriptionOptional = (): boolean => {
  const { isConnected, chain } = useWallet();

  return isConnected && !!chain?.isContestDescriptionOptional;
};
