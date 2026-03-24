import { useModal } from "@getpara/react-sdk-lite";
import { FC } from "react";
import AddFundsCard from "../../components/Card";
import { PARA_ONRAMP_CONFIG } from "./types";

interface AddFundsParaProviderProps {
  chain: string;
  onCloseModal?: () => void;
}

const AddFundsParaProvider: FC<AddFundsParaProviderProps> = ({ chain, onCloseModal }) => {
  const { openModal } = useModal();

  const handleClick = () => {
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
