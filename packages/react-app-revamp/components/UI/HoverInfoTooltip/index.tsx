import FloatingSurface from "@components/UI/Tooltip/FloatingSurface";
import { useTooltip } from "@components/UI/Tooltip/useTooltip";
import { type Placement } from "@floating-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CSSProperties, FC, ReactNode } from "react";

interface HoverInfoTooltipProps {
  ariaLabel: string;
  children: ReactNode;
  place?: Placement;
  buttonClassName?: string;
  contentClassName?: string;
  tooltipClassName?: string;
  tooltipStyle?: CSSProperties;
}

const HoverInfoTooltip: FC<HoverInfoTooltipProps> = ({
  ariaLabel,
  children,
  place = "right",
  buttonClassName = "text-neutral-9 hover:text-neutral-11",
  contentClassName = "text-[12px] text-true-black",
  tooltipClassName,
  tooltipStyle,
}) => {
  const tooltip = useTooltip({ interactive: true, placement: place, enableClick: true });

  return (
    <>
      <button
        ref={tooltip.refs.setReference}
        {...tooltip.getReferenceProps()}
        type="button"
        aria-label={ariaLabel}
        className={`flex items-center justify-center transition-colors ${buttonClassName}`}
      >
        <InformationCircleIcon className="w-5 h-5" />
      </button>
      <FloatingSurface tooltip={tooltip} surface="default" className={tooltipClassName} style={tooltipStyle}>
        <div className={contentClassName}>{children}</div>
      </FloatingSurface>
    </>
  );
};

export default HoverInfoTooltip;
