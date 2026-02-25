import AddFundsCard from "@components/AddFunds/components/Card";
import { toastError } from "@components/UI/Toast";
import { FC } from "react";
import { isChainSupportedForOnramp } from "./utils";
import { useWallet } from "@hooks/useWallet";
import useCoinbaseOnramp from "./hooks/useCoinbaseOnramp";

interface AddFundsCoinbaseProviderProps {
  chain: string;
  asset: string;
  disabled?: boolean;
}

const COINBASE_CONFIG = {
  name: "coinbase",
  description: "2.5% fees",
  logo: "/add-funds/coinbase.svg",
};

const AddFundsCoinbaseProvider: FC<AddFundsCoinbaseProviderProps> = ({ chain, asset, disabled = false }) => {
  const { userAddress } = useWallet();
  const { startOnramp, isLoading } = useCoinbaseOnramp();
  const isSupported = isChainSupportedForOnramp(chain);
  const isDisabled = disabled || !isSupported;

  const handleClick = () => {
    if (isDisabled || isLoading) return;

    if (!userAddress) {
      toastError({ message: "Please connect your wallet first" });
      return;
    }

    startOnramp(
      { address: userAddress, chain, asset },
      {
        onError: err => {
          console.error("Coinbase onramp error:", err);
          toastError({ message: "Failed to start onramp. Please try again." });
        },
      },
    );
  };

  const getDisabledMessage = (): string | undefined => {
    if (!isSupported) return `not available on ${chain}`;
    return undefined;
  };

  return (
    <AddFundsCard
      name={COINBASE_CONFIG.name}
      description={isLoading ? "loading..." : COINBASE_CONFIG.description}
      logo={COINBASE_CONFIG.logo}
      onClick={handleClick}
      disabled={isDisabled}
      logoBorderColor="#0052FF"
      disabledMessage={getDisabledMessage()}
    />
  );
};

export default AddFundsCoinbaseProvider;
