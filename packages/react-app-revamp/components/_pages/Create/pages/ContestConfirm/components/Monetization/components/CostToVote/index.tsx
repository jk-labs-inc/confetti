import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

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
  } = useDisplayPrice(startRaw, nativeCurrencySymbol ?? "");

  const {
    displayValue: endDisplay,
    displaySymbol: endSymbol,
    secondaryValue: endSecondary,
    secondarySymbol: endSecondarySymbol,
  } = useDisplayPrice(endRaw, nativeCurrencySymbol ?? "");

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
