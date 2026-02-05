import { ModalStep, useModal } from "@getpara/react-sdk-lite";
import { FC } from "react";
import AddFundsCard from "../../components/Card";
import { OnrampProviderConfig } from "./types";
import { getEnabledOnrampProviders } from "./utils";

const DISABLED_MESSAGE = "not available on this chain";

interface AddFundsOnrampProviderProps {
  onCloseModal?: () => void;
  disabled?: boolean;
}

interface OnrampProviderCardProps {
  provider: OnrampProviderConfig;
  onCloseModal?: () => void;
  disabled?: boolean;
}

const OnrampProviderCard: FC<OnrampProviderCardProps> = ({ provider, onCloseModal, disabled = false }) => {
  const { openModal } = useModal();
  const description = provider.restrictions ? `${provider.fees}  |  ${provider.restrictions}` : provider.fees;

  const handleClick = () => {
    if (disabled) return;
    // close parent modal first to avoid z-index issues
    onCloseModal?.();
    openModal({ step: ModalStep.ADD_FUNDS_BUY });
  };

  return (
    <AddFundsCard
      name={provider.name}
      description={description}
      logo={provider.logo}
      logoBorderColor={provider.logoBorderColor}
      variant="modal"
      onClick={handleClick}
      disabled={disabled}
      disabledMessage={disabled ? DISABLED_MESSAGE : undefined}
    />
  );
};

const AddFundsOnrampProvider: FC<AddFundsOnrampProviderProps> = ({ onCloseModal, disabled = false }) => {
  const enabledProviders = getEnabledOnrampProviders();

  if (enabledProviders.length === 0) {
    return <p className="text-neutral-9 text-[14px] italic">No onramp providers available</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {enabledProviders.map(provider => (
        <OnrampProviderCard key={provider.id} provider={provider} onCloseModal={onCloseModal} disabled={disabled} />
      ))}
    </div>
  );
};

export default AddFundsOnrampProvider;
