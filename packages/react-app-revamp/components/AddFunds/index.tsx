import { getChainLogo } from "@helpers/getChainLogo";
import Image from "next/image";
import { FC, useMemo, useState } from "react";
import AddFundsToggle from "./components/Toggle";
import AddFundsProviders, { AddFundsProviderType } from "./providers";
import { isOnrampSupportedForChain } from "./providers/onramp/utils";

interface AddFundsProps {
  chain: string;
  asset: string;
  showBackButton?: boolean;
  className?: string;
  onGoBack?: () => void;
  onCloseModal?: () => void;
}

const AddFunds: FC<AddFundsProps> = ({ chain, asset, onGoBack, showBackButton = true, className, onCloseModal }) => {
  const supportsOnramp = useMemo(() => isOnrampSupportedForChain(chain), [chain]);
  const [providerType, setProviderType] = useState<AddFundsProviderType>(AddFundsProviderType.ONRAMP);
  const chainLogo = getChainLogo(chain);

  const handleToggleChange = (type: AddFundsProviderType) => {
    setProviderType(type);
  };

  return (
    <div className={`flex flex-col gap-4 md:gap-6 w-full ${className}`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start md:items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <p className="text-[24px] font-bold text-neutral-11">
              add funds <span className="text-[12px]">on </span>
            </p>
            <div className="flex items-center gap-3">
              <Image src={chainLogo} alt={chain} width={32} height={32} />
              <p className="text-[24px] font-normal">{chain}</p>
            </div>
          </div>
        </div>

        <AddFundsToggle value={providerType} onChange={handleToggleChange} />

        <AddFundsProviders
          chain={chain}
          asset={asset}
          type={providerType}
          onCloseModal={onCloseModal}
          onrampDisabled={!supportsOnramp}
        />
      </div>
      <div className="flex items-start flex-col gap-4 md:gap-2">
        {showBackButton && (
          <div className="relative w-full pt-3 md:pt-0">
            <div
              className="absolute left-0 right-0 top-0 border-t border-neutral-2 md:hidden"
              style={{ width: "100vw", left: "50%", transform: "translateX(-50%)" }}
            ></div>
            <button className="flex items-center gap-[5px] cursor-pointer group" onClick={() => onGoBack?.()}>
              <div className="transition-transform duration-200 group-hover:-translate-x-1">
                <img src="/create-flow/back.svg" alt="back" width={15} height={15} className="mt-px" />
              </div>
              <p className="text-[16px]">back</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFunds;
