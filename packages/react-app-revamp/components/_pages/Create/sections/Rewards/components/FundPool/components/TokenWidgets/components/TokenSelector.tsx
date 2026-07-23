/* eslint-disable @next/next/no-img-element */
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FilteredToken } from "@hooks/useTokenList";
import { FC } from "react";
import { getRawTokenSymbol } from "./useTokenWidget";

interface TokenSelectorProps {
  localSelectedToken: FilteredToken;
  chainNativeCurrencySymbol: string;
  isEtherChainNativeCurrency: boolean;
  onOpen: () => void;
}

const TokenSelector: FC<TokenSelectorProps> = ({
  localSelectedToken,
  chainNativeCurrencySymbol,
  isEtherChainNativeCurrency,
  onOpen,
}) => {
  const isCustomToken = localSelectedToken && localSelectedToken.address !== "native";

  return (
    <div
      className="flex items-center gap-1 p-1 mt-2 bg-primary-5 border border-neutral-10 rounded-[10px] cursor-pointer"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label="Select token"
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      {isCustomToken ? (
        <img
          src={localSelectedToken?.logoURI ?? ""}
          alt="tokenLogo"
          className="rounded-full"
          width={16}
          height={16}
        />
      ) : isEtherChainNativeCurrency ? (
        <img src="/tokens/ether.svg" alt="ether" width={16} height={16} />
      ) : (
        <img src="/confetti/loader/frame-1.svg" alt="native token" width={16} height={16} />
      )}

      <p className="text-[16px] text-neutral-11 font-bold uppercase">
        {getRawTokenSymbol(localSelectedToken, chainNativeCurrencySymbol, "short")}
      </p>
      <ChevronDownIcon className="w-5 h-5 text-neutral-11" />
    </div>
  );
};

export default TokenSelector;
