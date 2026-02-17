import ButtonV3, { ButtonSize, ButtonType } from "@components/UI/ButtonV3";
import { useModal } from "@getpara/react-sdk-lite";
import { FC } from "react";

interface VoteButtonProps {
  isDisabled: boolean;
  isInvalidBalance: boolean;
  isConnected: boolean;
  onVote?: () => void;
  onAddFunds?: () => void;
}

enum VoteButtonType {
  INSUFFICIENT_BALANCE = "insufficientBalance",
  CONNECT_WALLET = "connectWallet",
  DEFAULT = "default",
}

const ButtonText = {
  [VoteButtonType.INSUFFICIENT_BALANCE]: "add funds to vote",
  [VoteButtonType.CONNECT_WALLET]: "connect wallet",
  [VoteButtonType.DEFAULT]: "buy votes",
};

const VoteButton: FC<VoteButtonProps> = ({ isDisabled, isInvalidBalance, isConnected, onVote, onAddFunds }) => {
  const { openModal } = useModal();

  const getButtonText = () => {
    if (isInvalidBalance) {
      return ButtonText[VoteButtonType.INSUFFICIENT_BALANCE];
    } else if (isConnected) {
      return ButtonText[VoteButtonType.DEFAULT];
    } else {
      return ButtonText[VoteButtonType.CONNECT_WALLET];
    }
  };

  const handleClick = () => {
    if (isInvalidBalance) {
      onAddFunds?.();
    } else if (!isConnected) {
      openModal();
    } else {
      onVote?.();
    }
  };

  return (
    <ButtonV3
      type={ButtonType.TX_ACTION}
      isDisabled={isInvalidBalance ? false : isDisabled}
      colorClass="px-[20px] text-[20px] font-bold bg-gradient-purple rounded-[40px] w-full"
      size={ButtonSize.FULL}
      onClick={handleClick}
    >
      <span className="w-full text-center">{getButtonText()}</span>
    </ButtonV3>
  );
};

export default VoteButton;
