import { FC, ReactNode } from "react";
import { Tooltip as ReactTooltip, type ITooltip } from "react-tooltip";

interface TooltipProps extends Omit<ITooltip, "children"> {
  children?: ReactNode;
  // Panel variant: a flat dark surface that matches the contest "full description" panel
  // (bg-primary-1 + soft neutral-11 text + 16px radius). Off by default so existing tooltips keep
  // their plain look.
  panel?: boolean;
}

const BASE = "z-50 focus:outline-none";
const DEFAULT_SURFACE = "p-2! bg-neutral-9! rounded-lg border border-transparent";
const PANEL_SURFACE = "p-3! bg-primary-1! rounded-[16px] border border-neutral-4 text-neutral-11";

// Single source of truth for tooltips. `clickable` + a hide delay keep the tooltip open while the
// pointer travels from the anchor onto the tooltip itself, so hovering its content never dismisses it
// (override `delayHide` if a given tooltip needs to snap shut). Pass `panel` for the flat dark
// surface used by the price-curve voter list.
const Tooltip: FC<TooltipProps> = ({ children, render, className = "", panel = false, delayHide, ...props }) => {
  return (
    <ReactTooltip
      clickable
      opacity={1}
      delayHide={delayHide ?? 150}
      render={render}
      className={`${BASE} ${panel ? PANEL_SURFACE : DEFAULT_SURFACE} ${className}`}
      {...props}
    >
      {render ? null : children}
    </ReactTooltip>
  );
};

export default Tooltip;
