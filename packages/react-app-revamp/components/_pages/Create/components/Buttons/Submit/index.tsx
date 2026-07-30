import AddFundsModal from "@components/AddFunds/components/Modal";
import ButtonV3, { ButtonSize, ButtonType } from "@components/UI/ButtonV3";
import { isWalletForbidden } from "@components/_pages/Create/utils/wallet";
import { useWallet } from "@hooks/useWallet";
import { useRouter } from "next/navigation";
import { FC, MouseEventHandler, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useBalance } from "wagmi";
import MobileBottomButton from "../Mobile";

interface CreateContestButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  errorShakeSignal?: number;
}

const CreateContestButton: FC<CreateContestButtonProps> = ({ onClick, errorShakeSignal = 0 }) => {
  const router = useRouter();
  const { isConnected, userAddress, chain, connector } = useWallet();
  const [shake, setShake] = useState(false);
  const isMobileOrTablet = useMediaQuery({ maxWidth: 1024 });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const { data: balance } = useBalance({
    address: userAddress,
    chainId: chain?.id,
  });
  const chainCurrencyDecimals = chain?.nativeCurrency.decimals || 18;
  const DUST_THRESHOLD = BigInt(10) ** BigInt(chainCurrencyDecimals - 6);
  const insufficientBalance = balance && (balance.value === BigInt(0) || balance.value < DUST_THRESHOLD);
  const chainNativeCurrency = chain?.nativeCurrency.symbol;
  const isUnsupportedWallet = connector && isWalletForbidden(connector.id);
  const needsFunds = Boolean(isConnected && insufficientBalance && !isUnsupportedWallet);

  useEffect(() => {
    if (!errorShakeSignal) return;

    setShake(true);
    const timeout = setTimeout(() => setShake(false), 600);
    return () => clearTimeout(timeout);
  }, [errorShakeSignal]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (needsFunds) {
      setShowAddFunds(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  if (isMobileOrTablet)
    return (
      <>
        <MobileBottomButton>
          <div className={`flex flex-row items-center h-12 justify-between border-t-neutral-2 border-t-2   px-8`}>
            <p className="text-[20px] text-neutral-11" onClick={handleBack}>
              back
            </p>
            <ButtonV3
              id="create_flow_deploy"
              onClick={handleClick}
              type={ButtonType.TX_ACTION}
              colorClass={`text-[20px] bg-gradient-create rounded-[15px] font-bold text-true-black hover:scale-105 transition-transform duration-200 ease-in-out ${
                shake ? "animate-shake-top" : ""
              }`}
            >
              create
            </ButtonV3>
          </div>
        </MobileBottomButton>
        <AddFundsModal
          chain={chain?.name.toLowerCase() ?? ""}
          asset={chainNativeCurrency ?? ""}
          isOpen={showAddFunds}
          onClose={() => setShowAddFunds(false)}
        />
      </>
    );

  return (
    <div className="flex gap-4 items-start pb-5 md:pb-0">
      <div className={`flex flex-col items-center gap-4`}>
        <ButtonV3
          id="create_flow_deploy"
          colorClass={`bg-gradient-create text-[20px] rounded-[10px] font-bold ${
            shake ? "animate-shake-top" : ""
          }  text-true-black`}
          size={ButtonSize.LARGE}
          type={ButtonType.TX_ACTION}
          onClick={handleClick}
        >
          create contest
        </ButtonV3>

        <div className="hidden lg:flex items-center gap-[2px] md:-ml-[15px] cursor-pointer group" onClick={handleBack}>
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
