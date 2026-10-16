import DualPriceDisplay from "@components/UI/DualPriceDisplay";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

interface TokenRewardCellProps {
  amount: string;
  symbol: string;
  address: string;
  chainName: string;
  isLast: boolean;
}

const TokenRewardCell: FC<TokenRewardCellProps> = ({ amount, symbol, address, chainName, isLast }) => {
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(amount, symbol, address, chainName);

  return (
    <div key={address} className="text-[14px] font-bold">
      <DualPriceDisplay
        displayValue={displayValue}
        displaySymbol={displaySymbol}
        secondaryValue={null}
        secondarySymbol={null}
        isLoading={isLoading}
      />
      {!isLast ? ", " : ""}
    </div>
  );
};

export default TokenRewardCell;
