import useRewardDisplayPrice from "@hooks/useRewards/useRewardDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { formatUnits } from "viem";

interface RewardsNumberDisplayProps {
  value: bigint;
  symbol: string;
  decimals: number;
  index: number;
  isBold?: boolean;
  tokenAddress?: string;
  chainName?: string;
}

const RewardsNumberDisplay: FC<RewardsNumberDisplayProps> = ({
  value,
  symbol,
  decimals,
  index,
  isBold = false,
  tokenAddress,
  chainName,
}) => {
  const nativeRaw = formatUnits(value, decimals);
  const { displayValue, displaySymbol, isLoading } = useRewardDisplayPrice(nativeRaw, symbol, tokenAddress, chainName);

  if (isLoading) {
    return <Skeleton width={120} height={40} baseColor="#706f78" highlightColor="#FFE25B" />;
  }

  return (
    <p key={index} className={`text-[40px] leading-none text-neutral-11 ${isBold ? "font-bold" : ""}`}>
      {displaySymbol === "$" ? `$${displayValue}` : displayValue}
      <span className="text-[16px] text-neutral-9 font-bold ml-1 uppercase">
        {displaySymbol === "$" ? "" : displaySymbol}
      </span>
    </p>
  );
};

export default RewardsNumberDisplay;
