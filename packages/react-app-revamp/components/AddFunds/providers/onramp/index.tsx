import { ModalStep, useModal } from "@getpara/react-sdk-lite";
import { FC } from "react";
import AddFundsCard from "../../components/Card";
import { PARA_ONRAMP_CONFIG } from "./types";

const DISABLED_MESSAGE = "not available on this chain";

interface AddFundsOnrampProviderProps {
  onCloseModal?: () => void;
  disabled?: boolean;
}

const AddFundsOnrampProvider: FC<AddFundsOnrampProviderProps> = ({ onCloseModal, disabled = false }) => {
  const { openModal } = useModal();

  const handleClick = () => {
    if (disabled) return;
    // Close parent modal first to avoid z-index issues
    onCloseModal?.();
    openModal({ step: ModalStep.ADD_FUNDS_BUY });
  };

  return (
    <AddFundsCard
      name={PARA_ONRAMP_CONFIG.name}
      description={PARA_ONRAMP_CONFIG.description}
      logo={PARA_ONRAMP_CONFIG.logo}
      variant="modal"
      onClick={handleClick}
      disabled={disabled}
      disabledMessage={disabled ? DISABLED_MESSAGE : undefined}
    />
  );
};

export default AddFundsOnrampProvider;
