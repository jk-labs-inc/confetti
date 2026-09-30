import { formatPnlPercentage } from "@helpers/percentages";
import { FC } from "react";

export type PnlPillVariant = "pill" | "text";

interface PnlPillProps {
  percentage: number | null;
  variant?: PnlPillVariant;
  className?: string;
}

const EMPTY_LABEL = "–";

const PnlPill: FC<PnlPillProps> = ({ percentage, variant = "pill", className = "" }) => {
  if (percentage === null) {
    return <span className={`text-[10px] font-bold text-neutral-9 ${className}`}>{EMPTY_LABEL}</span>;
  }

  const isPositive = percentage >= 0;
  const textColor = isPositive ? "text-positive-11" : "text-negative-11";
  const label = formatPnlPercentage(percentage);

  if (variant === "text") {
    return <span className={`text-[10px] font-bold tabular-nums ${textColor} ${className}`}>{label}</span>;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums ${textColor} ${
        isPositive ? "bg-positive-11/12" : "bg-negative-11/12"
      } ${className}`}
    >
      {label}
    </span>
  );
};

export default PnlPill;
