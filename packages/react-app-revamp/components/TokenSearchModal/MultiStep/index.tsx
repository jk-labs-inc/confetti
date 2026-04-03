import DialogModalV4 from "@components/UI/DialogModalV4";
import { getChainLogo } from "@helpers/getChainLogo";
import { FilteredToken } from "@hooks/useTokenList";
import { FC, useState } from "react";
import TokenSearchModalERC20 from "../ERC20";
import TokenSearchModalERC20MultiStepForm from "./components/Form";

interface TokenSearchModalERC20MultiStepProps {
  chainName: string;
  chainId: number;
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
  onSubmitTransfer?: (data: { token: FilteredToken; recipient: string; amount: string }) => void;
}

enum STEPS {
  SELECT_TOKEN = 1,
  TRANSFER_DETAILS = 2,
}

const TokenSearchModalERC20MultiStep: FC<TokenSearchModalERC20MultiStepProps> = ({
  isOpen,
  setIsOpen,
  chainName,
  chainId,
  onClose,
  onSubmitTransfer,
}) => {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_TOKEN);
  const [selectedToken, setSelectedToken] = useState<FilteredToken | null>(null);

  const handleClose = () => {
    setIsOpen?.(false);
    onClose?.();
    setCurrentStep(STEPS.SELECT_TOKEN);
    setSelectedToken(null);
  };

  const handleTokenSelect = (token: FilteredToken) => {
    setSelectedToken(token);
    setCurrentStep(STEPS.TRANSFER_DETAILS);
  };

  const handleBack = () => {
    setCurrentStep(STEPS.SELECT_TOKEN);
  };

  const handleSubmitTransfer = (recipient: string, amount: string) => {
    if (selectedToken && onSubmitTransfer) {
      onSubmitTransfer({
        token: selectedToken,
        recipient,
        amount,
      });
      handleClose();
    }
  };

  return (
    <DialogModalV4 isOpen={isOpen} onClose={handleClose} width="w-full" lgWidth="lg:max-w-[552px]">
      <div className="flex flex-col gap-8 py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <p className="text-[24px] text-neutral-11 font-bold">
              {currentStep === STEPS.SELECT_TOKEN ? (
                "select a token"
              ) : (
                <>
                  send <span className="uppercase">{selectedToken?.symbol}</span>
                </>
              )}
            </p>
            {getChainLogo(chainName) && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5">
                <img
                  src={getChainLogo(chainName)}
                  width={16}
                  height={16}
                  alt="chain logo"
                  className="rounded-full"
                />
                <span className="text-[12px] text-neutral-11 font-bold">{chainName}</span>
              </div>
            )}
          </div>
          <img
            src="/modal/modal_close.svg"
            alt="close"
            width={25}
            height={22}
            className="cursor-pointer"
            onClick={handleClose}
          />
        </div>
        <div className="bg-primary-5 h-[2px]" />

        {currentStep === STEPS.SELECT_TOKEN ? (
          <TokenSearchModalERC20 chainName={chainName} chainId={chainId} hideChains onSelectToken={handleTokenSelect} />
        ) : (
          <TokenSearchModalERC20MultiStepForm
            token={selectedToken!}
            onBack={handleBack}
            onSubmit={handleSubmitTransfer}
          />
        )}
      </div>
    </DialogModalV4>
  );
};

export default TokenSearchModalERC20MultiStep;
