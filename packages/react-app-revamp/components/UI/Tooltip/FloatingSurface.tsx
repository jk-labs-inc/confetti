import { FloatingArrow, FloatingFocusManager, FloatingPortal } from "@floating-ui/react";
import { CSSProperties, FC, ReactNode } from "react";
import { TooltipSurface, UseTooltipReturn } from "./useTooltip";

const SURFACE: Record<TooltipSurface, string> = {
  default: "p-2 bg-neutral-9 text-true-black rounded-lg",
  dark: "p-2 bg-neutral-4 text-white rounded-lg",
  panel: "p-3 bg-primary-1 text-neutral-11 rounded-[16px] border border-neutral-4",
};

const ARROW: Record<TooltipSurface, { fill: string; stroke?: string }> = {
  default: { fill: "#9d9d9d" },
  dark: { fill: "#28282c" },
  panel: { fill: "#1a1a1a", stroke: "#28282c" },
};

interface FloatingSurfaceProps {
  tooltip: UseTooltipReturn;
  surface?: TooltipSurface;
  arrow?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const FloatingSurface: FC<FloatingSurfaceProps> = ({
  tooltip,
  surface = "default",
  arrow = true,
  className = "",
  style,
  children,
}) => {
  const { isMounted, interactive, refs, context, floatingStyles, transitionStyles, arrowRef, getFloatingProps } =
    tooltip;

  if (!isMounted) return null;

  const arrowColors = ARROW[surface];

  const node = (
    <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-1000 focus:outline-none">
      <div style={transitionStyles}>
        <div style={style} className={`${SURFACE[surface]} ${className}`}>
          {children}
        </div>
        {arrow && (
          <FloatingArrow
            ref={arrowRef}
            context={context}
            fill={arrowColors.fill}
            stroke={arrowColors.stroke}
            strokeWidth={arrowColors.stroke ? 1 : 0}
            width={11}
            height={5}
          />
        )}
      </div>
    </div>
  );

  return (
    <FloatingPortal>
      {interactive ? (
        <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
          {node}
        </FloatingFocusManager>
      ) : (
        node
      )}
    </FloatingPortal>
  );
};

export default FloatingSurface;
