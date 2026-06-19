import { type Placement } from "@floating-ui/react";
import { CSSProperties, ElementType, FC, ReactNode } from "react";
import FloatingSurface from "./FloatingSurface";
import { TooltipSurface, useTooltip } from "./useTooltip";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  place?: Placement;
  surface?: TooltipSurface;
  offset?: number;
  arrow?: boolean;
  disabled?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  openDelay?: number;
  closeDelay?: number;
}

const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  place = "top",
  surface = "default",
  offset = 8,
  arrow = true,
  disabled = false,
  as: As = "span",
  className,
  style,
  openDelay,
  closeDelay,
}) => {
  const tooltip = useTooltip({ placement: place, offsetPx: offset, openDelay, closeDelay });

  if (disabled) return <>{children}</>;

  return (
    <>
      <As ref={tooltip.refs.setReference} {...tooltip.getReferenceProps()}>
        {children}
      </As>
      <FloatingSurface tooltip={tooltip} surface={surface} arrow={arrow} className={className} style={style}>
        {content}
      </FloatingSurface>
    </>
  );
};

export default Tooltip;
