import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

interface PriceDisplayProps {
  price: string;
  label: string;
  chainUnitLabel: string;
}

const PriceDisplay: FC<PriceDisplayProps> = ({ price, label, chainUnitLabel }) => {
  const { displayValue, displaySymbol } = useDisplayPrice(price, chainUnitLabel);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold text-neutral-9">price/vote at {label}</p>
      <p className="text-xl md:text-2xl font-bold text-neutral-11">
        {displaySymbol === "$" ? (
          `$${displayValue}`
        ) : (
          <>
            {displayValue} <span className="uppercase">{displaySymbol}</span>
          </>
        )}
      </p>
    </div>
  );
};

export default PriceDisplay;
