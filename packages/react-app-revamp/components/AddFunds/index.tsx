import { getChainLogo } from "@helpers/getChainLogo";
import Image from "next/image";
import { FC, memo } from "react";
import { useShallow } from "zustand/shallow";
import AddFundsToggle from "./components/Toggle";
import AddFundsProviders from "./providers";
import { useAddFundsStore } from "./store";

interface AddFundsProps {
  chain: string;
  asset: string;
  showBackButton?: boolean;
  className?: string;
  onGoBack?: () => void;
  onCloseModal?: () => void;
  onBridgeSuccess?: () => void;
}

const AddFunds: FC<AddFundsProps> = ({
  chain,
  asset,
  onGoBack,
  showBackButton = true,
  className,
  onCloseModal,
  onBridgeSuccess,
}) => {
  const chainLogo = getChainLogo(chain);
  const { providerType, setProviderType } = useAddFundsStore(
    useShallow(state => ({
      providerType: state.providerType,
      setProviderType: state.setProviderType,
    })),
  );

  return (
    <div id="add_funds_modal" className={`@container flex flex-col w-full h-full ${className}`}>
      <div className="flex flex-col gap-4 md:gap-6 flex-1 min-h-0">
        <div className="flex items-start md:items-center justify-between w-full">
          <div className="flex min-w-0 items-center gap-3 @max-[320px]:gap-2">
            <p className="shrink-0 text-[24px] @max-[320px]:text-[18px] font-bold text-neutral-11">
              add funds <span className="text-[12px]">on </span>
            </p>
            <div className="flex min-w-0 items-center gap-3 @max-[320px]:gap-1.5">
              <Image src={chainLogo} alt={chain} width={32} height={32} className="shrink-0 @max-[320px]:size-5" />
              <p className="truncate text-[24px] @max-[320px]:text-[16px] font-normal">{chain}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AddFundsToggle value={providerType} onChange={setProviderType} />

          <AddFundsProviders
            chain={chain}
            asset={asset}
            type={providerType}
            onCloseModal={onCloseModal}
            onBridgeSuccess={onBridgeSuccess}
          />
        </div>
      </div>
      {showBackButton && (
        <div className="pt-3 shrink-0">
          <button className="flex items-center gap-[5px] cursor-pointer group" onClick={() => onGoBack?.()}>
            <div className="flex items-center transition-transform duration-200 group-hover:-translate-x-1">
              <img src="/create-flow/back.svg" alt="back" width={15} height={15} />
            </div>
            <p className="text-[16px] leading-none">back</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(AddFunds);
