import Tooltip from "@components/UI/Tooltip";
import { flip, offset, shift } from "@floating-ui/dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CSSProperties, FC, ReactNode, useEffect, useId, useRef, useState } from "react";
import type { PlacesType } from "react-tooltip";

interface HoverInfoTooltipProps {
  ariaLabel: string;
  children: ReactNode;
  place?: PlacesType;
  buttonClassName?: string;
  contentClassName?: string;
  tooltipClassName?: string;
  tooltipStyle?: CSSProperties;
}

const HIDE_DELAY_MS = 150;

const middlewares = [offset(10), flip({ fallbackPlacements: ["bottom"] }), shift({ padding: 5 })];

const HoverInfoTooltip: FC<HoverInfoTooltipProps> = ({
  ariaLabel,
  children,
  place = "right",
  buttonClassName = "text-neutral-9 hover:text-neutral-11",
  contentClassName = "text-[12px] text-true-black",
  tooltipClassName,
  tooltipStyle,
}) => {
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimerRef.current = setTimeout(() => setIsOpen(false), HIDE_DELAY_MS);
  };

  const open = () => {
    cancelHide();
    setIsOpen(true);
  };

  useEffect(() => cancelHide, []);

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        data-tooltip-id={tooltipId}
        data-tooltip-place={place}
        data-tooltip-position-strategy="fixed"
        onMouseEnter={open}
        onMouseLeave={scheduleHide}
        onFocus={open}
        onBlur={scheduleHide}
        className={`flex items-center justify-center transition-colors ${buttonClassName}`}
      >
        <InformationCircleIcon className="w-5 h-5" />
      </button>
      <Tooltip
        id={tooltipId}
        place={place}
        positionStrategy="fixed"
        offset={10}
        middlewares={middlewares}
        isOpen={isOpen}
        imperativeModeOnly
        style={tooltipStyle}
        className={tooltipClassName}
      >
        <div onMouseEnter={cancelHide} onMouseLeave={scheduleHide} className={contentClassName}>
          {children}
        </div>
      </Tooltip>
    </>
  );
};

export default HoverInfoTooltip;
