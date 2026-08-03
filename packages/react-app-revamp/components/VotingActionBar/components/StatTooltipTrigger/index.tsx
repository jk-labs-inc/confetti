import FloatingSurface from "@components/UI/Tooltip/FloatingSurface";
import { useTooltip } from "@components/UI/Tooltip/useTooltip";
import { FC, ReactNode } from "react";

interface StatTooltipTriggerProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
}

const StatTooltipTrigger: FC<StatTooltipTriggerProps> = ({ content, children, className, tooltipClassName }) => {
  const tooltip = useTooltip({ interactive: true, placement: "top", enableClick: true });

  return (
    <>
      <button
        ref={tooltip.refs.setReference}
        {...tooltip.getReferenceProps({
          onPointerDown: event => event.preventDefault(),
        })}
        type="button"
        className={`focus:outline-none ${className ?? ""}`}
      >
        {children}
      </button>
      <FloatingSurface tooltip={tooltip} surface="default" className={tooltipClassName}>
        <div className="text-[12px] text-true-black">{content}</div>
      </FloatingSurface>
    </>
  );
};

export default StatTooltipTrigger;
