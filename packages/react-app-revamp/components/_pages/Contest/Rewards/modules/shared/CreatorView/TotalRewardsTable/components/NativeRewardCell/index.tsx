import DualPriceDisplay from "@components/UI/DualPriceDisplay";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

interface NativeRewardCellProps {
  amount: string;
  symbol: string;
}

const NativeRewardCell: FC<NativeRewardCellProps> = ({ amount, symbol }) => {
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(amount, symbol);

  return (
    <p>
      <DualPriceDisplay
        displayValue={displayValue}
        displaySymbol={displaySymbol}
        secondaryValue={null}
        secondarySymbol={null}
        isLoading={isLoading}
      />
    </p>
  );
};

export default NativeRewardCell;
