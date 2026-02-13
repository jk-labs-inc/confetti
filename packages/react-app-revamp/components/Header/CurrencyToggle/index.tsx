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
    <button
      type="button"
      onClick={toggleCurrency}
      onKeyDown={handleKeyDown}
      aria-label={`Switch to ${isUsd ? "native crypto" : "USD"} pricing`}
      className="relative flex h-8 w-[88px] items-center rounded-full border border-primary-3 bg-secondary-1 p-1 cursor-pointer transition-all duration-200 ease-in-out"
    >
      <span
        className={`absolute size-6 rounded-full transition-all duration-200 ease-in-out ${
          isUsd ? "left-[calc(100%-24px-4px)] bg-gradient-purple-pastel" : "left-1 bg-gradient-gray-dark"
        }`}
      />
      <span
        className={`z-10 flex w-full items-center text-base uppercase font-bold text-neutral-9 transition-all duration-200 ${
          isUsd ? "justify-start pl-2" : "justify-end pr-2"
        }`}
      >
        {isUsd ? "$USD" : "$ETH"}
      </span>
    </button>
  );
};

export default CurrencyToggle;
