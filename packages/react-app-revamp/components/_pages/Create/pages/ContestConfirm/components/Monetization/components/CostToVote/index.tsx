import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";

interface CostToVoteMessageProps {
  costToVote?: number;
  costToVoteEndPrice?: number;
  nativeCurrencySymbol?: string;
}

const CostToVoteMessage: FC<CostToVoteMessageProps> = ({ costToVote, costToVoteEndPrice, nativeCurrencySymbol }) => {
  const startRaw = costToVote?.toString() ?? "0";
  const endRaw = costToVoteEndPrice?.toString() ?? "0";

  const { displayValue: startDisplay, displaySymbol } = useDisplayPrice(startRaw, nativeCurrencySymbol ?? "");
  const { displayValue: endDisplay } = useDisplayPrice(endRaw, nativeCurrencySymbol ?? "");

  const pricePrefix = displaySymbol === "$" ? "$" : "";
  const priceSuffix = displaySymbol === "$" ? "" : ` ${nativeCurrencySymbol}`;

  return (
    <li className="text-[16px]">
      <span className="uppercase">
        {pricePrefix}{startDisplay}{priceSuffix}
      </span>{" "}
      (at start) to{" "}
      <span className="uppercase">
        {pricePrefix}{endDisplay}{priceSuffix}
      </span>{" "}
      (at finish) per vote
    </li>
  );
};

export default CostToVoteMessage;
