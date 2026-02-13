import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";

interface CostToVoteMessageProps {
  costToVote?: number;
  costToVoteEndPrice?: number;
  nativeCurrencySymbol?: string;
}

const formatPrice = (value: string, symbol: string): string => {
  return symbol === "$" ? `$${value}` : `${value} ${symbol}`;
};

const CostToVoteMessage: FC<CostToVoteMessageProps> = ({ costToVote, costToVoteEndPrice, nativeCurrencySymbol }) => {
  const startRaw = costToVote?.toString() ?? "0";
  const endRaw = costToVoteEndPrice?.toString() ?? "0";

  const {
    displayValue: startDisplay,
    displaySymbol: startSymbol,
    secondaryValue: startSecondary,
    secondarySymbol: startSecondarySymbol,
    isLoading: isStartLoading,
  } = useDisplayPrice(startRaw, nativeCurrencySymbol ?? "");

  const {
    displayValue: endDisplay,
    displaySymbol: endSymbol,
    secondaryValue: endSecondary,
    secondarySymbol: endSecondarySymbol,
    isLoading: isEndLoading,
  } = useDisplayPrice(endRaw, nativeCurrencySymbol ?? "");

  if (isStartLoading || isEndLoading) {
    return (
      <li className="text-[16px]">
        <Skeleton width={200} height={16} baseColor="#706f78" highlightColor="#FFE25B" inline />
      </li>
    );
  }

  const startPrimary = formatPrice(startDisplay, startSymbol);
  const endPrimary = formatPrice(endDisplay, endSymbol);
  const startSecondaryFormatted =
    startSecondary && startSecondarySymbol ? formatPrice(startSecondary, startSecondarySymbol) : null;
  const endSecondaryFormatted =
    endSecondary && endSecondarySymbol ? formatPrice(endSecondary, endSecondarySymbol) : null;

  return (
    <li className="text-[16px]">
      <span>{startPrimary}</span> at start
      {startSecondaryFormatted && <span> ({startSecondaryFormatted})</span>} to <span>{endPrimary}</span> at finish
      {endSecondaryFormatted && <span> ({endSecondaryFormatted})</span>} per vote
    </li>
  );
};

export default CostToVoteMessage;
