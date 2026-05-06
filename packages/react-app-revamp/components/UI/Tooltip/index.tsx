import { FC, ReactNode } from "react";
import { Tooltip as ReactTooltip, type ITooltip } from "react-tooltip";

interface TooltipProps extends Omit<ITooltip, "children"> {
  children: ReactNode;
}

const Tooltip: FC<TooltipProps> = ({ children, className = "", ...props }) => {
  return (
    <ReactTooltip
      clickable
      opacity={1}
      className={`p-2! z-50 bg-neutral-9! border border-transparent rounded-lg focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </ReactTooltip>
  );
};

export default Tooltip;
