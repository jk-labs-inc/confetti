import HoverInfoTooltip from "@components/UI/HoverInfoTooltip";
import { type Placement } from "@floating-ui/react";
import { FC } from "react";
import WouldWinNowTooltipContent from "../WouldWinNowTooltipContent";

interface WouldWinNowTooltipProps {
  isBelowSpend: boolean;
  iconClassName?: string;
  place?: Placement;
}

const WouldWinNowTooltip: FC<WouldWinNowTooltipProps> = ({ isBelowSpend, iconClassName, place }) => {
  return (
    <HoverInfoTooltip
      ariaLabel="how would win now works"
      buttonClassName="text-neutral-14 hover:text-neutral-11"
      tooltipClassName="max-w-[250px]"
      iconClassName={iconClassName}
      place={place}
    >
      <WouldWinNowTooltipContent isBelowSpend={isBelowSpend} />
    </HoverInfoTooltip>
  );
};

export default WouldWinNowTooltip;
