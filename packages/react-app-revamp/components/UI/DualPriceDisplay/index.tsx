import { FC } from "react";
import Skeleton from "react-loading-skeleton";

interface DualPriceDisplayProps {
  displayValue: string;
  displaySymbol: string;
  secondaryValue: string | null;
  secondarySymbol: string | null;
  primaryClassName?: string;
  secondaryClassName?: string;
  isLoading?: boolean;
  skeletonWidth?: number;
  skeletonHeight?: number;
}

/**
 * Renders a primary price with an optional secondary price separated by a pipe.
 *
 * Examples:
 *  - USD mode:    "$6,900.00 | 3.25 ETH"
 *  - Native mode: "3.25 ETH | $6,900.00"
 */
const DualPriceDisplay: FC<DualPriceDisplayProps> = ({
  displayValue,
  displaySymbol,
  secondaryValue,
  secondarySymbol,
  primaryClassName = "",
  secondaryClassName = "",
  isLoading = false,
  skeletonWidth = 100,
  skeletonHeight = 16,
}) => {
  if (isLoading) {
    return <Skeleton width={skeletonWidth} height={skeletonHeight} baseColor="#706f78" highlightColor="#FFE25B" />;
  }

  const primaryFormatted = displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;

  if (!secondaryValue || !secondarySymbol) {
    return <span className={primaryClassName}>{primaryFormatted}</span>;
  }

  const secondaryFormatted = secondarySymbol === "$" ? `$${secondaryValue}` : `${secondaryValue} ${secondarySymbol}`;

  return (
    <span className={primaryClassName}>
      {primaryFormatted}
      <span className={`ml-1.5 font-bold ${secondaryClassName}`}>| {secondaryFormatted}</span>
    </span>
  );
};

export default DualPriceDisplay;
