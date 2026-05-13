import { ROUTE_CREATE_CONTEST } from "@config/routes";
import { getNativeTokenSymbol } from "@helpers/nativeToken";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { useWallet } from "@hooks/useWallet";
import { useParams, usePathname } from "next/navigation";
import { FC } from "react";

const DEFAULT_NATIVE_SYMBOL = "ETH";

const CurrencyToggle: FC = () => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const toggleCurrency = useCurrencyStore(state => state.toggleCurrency);
  const params = useParams();
  const pathname = usePathname();
  const { chain: walletChain } = useWallet();

  const contestChain = typeof params?.chain === "string" ? params.chain : undefined;
  const isCreateFlow = pathname === ROUTE_CREATE_CONTEST;

  let nativeSymbol = DEFAULT_NATIVE_SYMBOL;
  if (contestChain) {
    nativeSymbol = getNativeTokenSymbol(contestChain) ?? DEFAULT_NATIVE_SYMBOL;
  } else if (isCreateFlow) {
    nativeSymbol = walletChain?.nativeCurrency?.symbol ?? DEFAULT_NATIVE_SYMBOL;
  }

  const isUsd = displayCurrency === "usd";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCurrency();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      onKeyDown={handleKeyDown}
      aria-label={`Switch to ${isUsd ? "native crypto" : "USD"} pricing`}
      className="relative inline-flex h-8 items-center rounded-full border border-primary-3 bg-secondary-1 cursor-pointer transition-all duration-200 ease-in-out"
    >
      <span
        className={`absolute size-6 rounded-full transition-all duration-200 ease-in-out ${
          isUsd ? "left-[calc(100%-24px-4px)] bg-gradient-purple-pastel" : "left-1 bg-gradient-gray-dark"
        }`}
      />
      <span
        className={`z-10 text-base uppercase font-bold text-neutral-9 transition-all duration-200 ${
          isUsd ? "pl-3 pr-9" : "pl-9 pr-3"
        }`}
      >
        {isUsd ? "$USD" : `$${nativeSymbol}`}
      </span>
    </button>
  );
};

export default CurrencyToggle;
