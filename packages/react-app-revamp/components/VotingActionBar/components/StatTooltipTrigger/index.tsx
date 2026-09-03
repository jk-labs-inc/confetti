import FloatingSurface from "@components/UI/Tooltip/FloatingSurface";
import { useTooltip } from "@components/UI/Tooltip/useTooltip";
import { useVotingFocusModeStore } from "@components/VotingActionBar/store";
import { FC, ReactNode } from "react";
import { useShallow } from "zustand/shallow";

interface StatTooltipTriggerProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
}

const StatTooltipTrigger: FC<StatTooltipTriggerProps> = ({ content, children, className, tooltipClassName }) => {
  const isFocusMode = useVotingFocusModeStore(useShallow(state => state.isFocusMode));
  const tooltip = useTooltip({ interactive: true, placement: "top", enableClick: true });

  return (
    <>
      <button
        ref={tooltip.refs.setReference}
        {...(isFocusMode
          ? tooltip.getReferenceProps({
              onPointerDown: event => event.preventDefault(),
              onClick: event => event.stopPropagation(),
            })
          : {})}
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
