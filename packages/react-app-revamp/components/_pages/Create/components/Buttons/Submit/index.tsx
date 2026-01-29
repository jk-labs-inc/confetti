import AddFundsModal from "@components/AddFunds/components/Modal";
import ButtonV3, { ButtonSize, ButtonType } from "@components/UI/ButtonV3";
import { usePreviousStep } from "@components/_pages/Create/hooks/usePreviousStep";
import { isWalletForbidden } from "@components/_pages/Create/pages/ContestConfirm/utils";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useWallet } from "@hooks/useWallet";
import { FC, MouseEventHandler, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useBalance } from "wagmi";
import MobileBottomButton from "../Mobile";

interface CreateContestButtonProps {
  step: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
}

enum CreateButtonText {
  CREATE = "create contest",
  CONNECT_WALLET = "connect wallet",
  ADD_FUNDS = "add funds",
}

const CreateContestButton: FC<CreateContestButtonProps> = ({ step, onClick, isDisabled }) => {
  const { errors } = useDeployContestStore(state => state);
  const { isConnected, userAddress, chain, connector } = useWallet();
  const [shake, setShake] = useState(false);
  const onPreviousStep = usePreviousStep();
  const isMobileOrTablet = useMediaQuery({ maxWidth: 1024 });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const { data: balance } = useBalance({
    address: userAddress,
    chainId: chain?.id,
  });
  const chainCurrencyDecimals = chain?.nativeCurrency.decimals || 18;
  const DUST_THRESHOLD = BigInt(10) ** BigInt(chainCurrencyDecimals - 6);
  const insufficientBalance = balance && (balance.value === BigInt(0) || balance.value < DUST_THRESHOLD);
  const [createButtonText, setCreateButtonText] = useState(CreateButtonText.CREATE);
  const chainNativeCurrency = chain?.nativeCurrency.symbol;
  const isUnsupportedWallet = connector && isWalletForbidden(connector.id);

  useEffect(() => {
    if (!isConnected) {
      setCreateButtonText(CreateButtonText.CONNECT_WALLET);
    } else if (insufficientBalance && !isUnsupportedWallet) {
      setCreateButtonText(CreateButtonText.ADD_FUNDS);
    } else {
      setCreateButtonText(CreateButtonText.CREATE);
    }
  }, [insufficientBalance, isConnected, isUnsupportedWallet]);

  useEffect(() => {
    // If there's an error for the current step, shake the button
    if (errors.find(error => error.step === step - 1)) {
      setShake(true);
    } else {
      setShake(false);
    }
  }, [errors, step]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If there's an error, shake the button
    if (errors.find(error => error.step === step - 1)) {
      setShake(true);
    }

    if (createButtonText === CreateButtonText.ADD_FUNDS) {
      setShowAddFunds(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  if (isMobileOrTablet)
    return (
      <MobileBottomButton>
        <div className={`flex flex-row items-center h-12 justify-between border-t-neutral-2 border-t-2   px-8`}>
          <p className="text-[20px] text-neutral-11" onClick={onPreviousStep}>
            back
          </p>
          <ButtonV3
            onClick={handleClick}
            colorClass="text-[20px] bg-gradient-create rounded-[15px] font-bold text-true-black hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            {!isConnected ? "connect wallet" : insufficientBalance && !isUnsupportedWallet ? "add funds" : "create"}
          </ButtonV3>
        </div>
      </MobileBottomButton>
    );

  return (
    <div className="flex gap-4 items-start pb-5 md:pb-0">
      <div className={`flex flex-col items-center gap-4`}>
        <ButtonV3
          isDisabled={isDisabled}
          colorClass={`bg-gradient-create text-[20px] rounded-[10px] font-bold ${
            shake ? "animate-shake-top" : ""
          }  text-true-black`}
          size={ButtonSize.LARGE}
          type={ButtonType.TX_ACTION}
          onClick={handleClick}
        >
          {createButtonText}
        </ButtonV3>

        <div
          className="hidden lg:flex items-center gap-[2px] md:-ml-[15px] cursor-pointer group"
          onClick={onPreviousStep}
        >
          <div className="transition-transform duration-200 group-hover:-translate-x-1">
            <img src="/create-flow/back.svg" alt="back" width={15} height={15} className="mt-px" />
          </div>
          <p className="text-[16px]">back</p>
        </div>
      </div>
      <AddFundsModal
        chain={chain?.name.toLowerCase() ?? ""}
        asset={chainNativeCurrency ?? ""}
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
      />
    </div>
  );
};

export default CreateContestButton;
