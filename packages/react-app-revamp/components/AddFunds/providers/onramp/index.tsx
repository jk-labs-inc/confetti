import { toastError } from "@components/UI/Toast";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useModal } from "@getpara/react-sdk-lite";
import { getChainId } from "@helpers/getChainId";
import { useWallet } from "@hooks/useWallet";
import { switchChain } from "@wagmi/core";
import { FC } from "react";
import AddFundsCard from "../../components/Card";
import { PARA_ONRAMP_CONFIG } from "./types";

interface AddFundsParaProviderProps {
  chain: string;
  onCloseModal?: () => void;
}

const AddFundsParaProvider: FC<AddFundsParaProviderProps> = ({ chain, onCloseModal }) => {
  const { openModal } = useModal();
  const { chain: connectedChain } = useWallet();
  const contestChainId = getChainId(chain);

  const handleClick = async () => {
    if (connectedChain?.id !== contestChainId) {
      try {
        await switchChain(getWagmiConfig(), { chainId: contestChainId });
      } catch {
        toastError({ message: `Please switch your wallet to ${chain} to add funds` });
        return;
      }
    }

    onCloseModal?.();
    openModal({ step: "ACCOUNT_ADD_FUNDS_BUY" });
  };

  return (
    <AddFundsCard
      name={PARA_ONRAMP_CONFIG.name}
      description={PARA_ONRAMP_CONFIG.description}
      logo={PARA_ONRAMP_CONFIG.logo}
      logoBorderColor="#7B3FE4"
      onClick={handleClick}
    />
  );
};

export default AddFundsParaProvider;
