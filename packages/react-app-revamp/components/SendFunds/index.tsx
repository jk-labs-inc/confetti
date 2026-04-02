import TokenSearchModalERC20MultiStep from "@components/TokenSearchModal/MultiStep";
import { toastError } from "@components/UI/Toast";
import { useSendToken } from "@hooks/useSendToken";
import { FilteredToken } from "@hooks/useTokenList";
import { useWallet } from "@hooks/useWallet";
import { FC } from "react";

interface SendFundsProps {
  isOpen: boolean;
  onClose: () => void;
  recipientAddress?: string;
}

const SendFunds: FC<SendFundsProps> = ({ isOpen, onClose, recipientAddress }) => {
  const { chain: currentChain } = useWallet();
  const chainId = currentChain?.id ?? 1;
  const chainName = currentChain?.name?.toLowerCase() ?? "mainnet";
  const { sendToken } = useSendToken({
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmitTransfer = async (data: { token: FilteredToken; recipient: string; amount: string }) => {
    const recipient = data.recipient || recipientAddress;

    if (!recipient) {
      toastError({
        message: "recipient address is required",
      });
      return;
    }

    if (!data.token.balance || data.token.balance === 0) {
      toastError({
        message: "insufficient token balance",
      });
      return;
    }

    try {
      await sendToken(data.token, chainId, recipient, data.amount);
    } catch (error) {
      console.error("Failed to send token:", error);
    }
  };

  return (
    <TokenSearchModalERC20MultiStep
      chainName={chainName}
      chainId={chainId}
      isOpen={isOpen}
      onClose={onClose}
      onSubmitTransfer={handleSubmitTransfer}
    />
  );
};

export default SendFunds;
