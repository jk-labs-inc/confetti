import { useCurrencyStore } from "@hooks/useCurrency/store";
import { FC } from "react";

const CurrencyToggle: FC = () => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const toggleCurrency = useCurrencyStore(state => state.toggleCurrency);

  const isUsd = displayCurrency === "usd";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCurrency();
    }
  };

  return (
    <div
      role="button"
      onClick={toggleCurrency}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Switch to ${isUsd ? "native crypto" : "USD"} pricing`}
      className="relative grid h-10 grid-cols-2 items-center rounded-2xl bg-primary-1 p-1 border border-transparent hover:border-neutral-17 transition-all duration-200 ease-in-out cursor-pointer"
    >
      <span
        className={`absolute inset-y-1 w-[calc(50%-6px)] rounded-xl bg-neutral-17 transition-all duration-200 ease-in-out ${
          isUsd ? "left-1" : "left-[calc(50%+2px)]"
        }`}
      />
      <span
        className={`z-10 flex h-8 items-center justify-center px-4 text-[14px] font-bold transition-colors duration-200 ${
          isUsd ? "text-neutral-11" : "text-neutral-10"
        }`}
      >
        usd
      </span>
      <span
        className={`z-10 flex h-8 items-center justify-center px-4 text-[14px] font-bold transition-colors duration-200 ${
          !isUsd ? "text-neutral-11" : "text-neutral-10"
        }`}
      >
        crypto
      </span>
    </div>
  );
};

export default CurrencyToggle;
