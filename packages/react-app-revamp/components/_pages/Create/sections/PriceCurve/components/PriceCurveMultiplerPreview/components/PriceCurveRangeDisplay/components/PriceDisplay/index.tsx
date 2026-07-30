import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";

interface PriceDisplayProps {
  price: string;
  label: string;
  chainUnitLabel: string;
}

const formatPrice = (value: string, symbol: string) => {
  if (symbol === "$") return `$${value}`;
  return `${value} ${symbol.toUpperCase()}`;
};

const PriceDisplay: FC<PriceDisplayProps> = ({ price, label, chainUnitLabel }) => {
  const { displayValue, displaySymbol, secondaryValue, secondarySymbol, isLoading } = useDisplayPrice(price, chainUnitLabel);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold text-neutral-9">price/vote at {label}</p>
      <div className="relative">
        {isLoading ? (
          <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
        ) : (
          <>
            <p className="text-xl md:text-2xl font-bold text-neutral-11 uppercase">
              {formatPrice(displayValue, displaySymbol)}
            </p>
            {secondaryValue && secondarySymbol ? (
              <p className="absolute top-full mt-1 text-sm font-bold text-neutral-9 uppercase whitespace-nowrap">
                {formatPrice(secondaryValue, secondarySymbol)}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
