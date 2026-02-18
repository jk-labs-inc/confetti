import { getChainLogo } from "@helpers/getChainLogo";
import Image from "next/image";
import { FC } from "react";
import AddFundsProviders, { AddFundsProviderType } from "./providers";

interface AddFundsProps {
  chain: string;
  asset: string;
  showBackButton?: boolean;
  className?: string;
  onGoBack?: () => void;
}

const AddFunds: FC<AddFundsProps> = ({ chain, asset, onGoBack, showBackButton = true, className }) => {
  const chainLogo = getChainLogo(chain);

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      <div className="flex flex-col gap-4 md:gap-6 flex-1 min-h-0">
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
          <AddFundsProviders chain={chain} asset={asset} type={AddFundsProviderType.BRIDGE} />
        </div>
      </div>
      {showBackButton && (
        <div className="sticky bottom-0 -mx-6 px-6 bg-true-black border-t border-neutral-2 pt-3 pb-2 md:relative md:mx-0 md:px-0 md:pt-0 md:pb-0 md:border-t-0 shrink-0">
          <button className="flex items-center gap-[5px] cursor-pointer group" onClick={() => onGoBack?.()}>
            <div className="transition-transform duration-200 group-hover:-translate-x-1">
              <img src="/create-flow/back.svg" alt="back" width={15} height={15} className="mt-px" />
            </div>
            <p className="text-[16px]">back</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddFunds;
