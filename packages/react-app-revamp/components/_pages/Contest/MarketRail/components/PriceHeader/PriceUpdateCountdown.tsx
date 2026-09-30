import { useNextPriceUpdate } from "@hooks/useNextPriceUpdate";
import { usePriceUpdateWarning } from "@hooks/useNextPriceUpdate/usePriceUpdateWarning";
import { FC } from "react";

const PriceUpdateCountdown: FC = () => {
  const nextPriceUpdate = useNextPriceUpdate();
  usePriceUpdateWarning(nextPriceUpdate);
  const { secondsUntilNextUpdate, percentage, phase, updateIntervalSeconds, isLoading } = nextPriceUpdate;

  if (isLoading || phase === "after") return null;
  if (phase === "before" && updateIntervalSeconds <= 0) return null;

  const percentageText = percentage && !percentage.isBelowThreshold ? `${percentage.percentageIncrease}% ` : "";
  const text =
    phase === "during" ? `▲ ${percentageText}in ${secondsUntilNextUpdate}s` : `every ${updateIntervalSeconds}s`;

  return <span className="text-[11px] font-semibold text-positive-11 whitespace-nowrap tabular-nums">{text}</span>;
};

export default PriceUpdateCountdown;
