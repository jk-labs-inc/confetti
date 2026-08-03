import HoverInfoTooltip from "@components/UI/HoverInfoTooltip";
import { type Placement } from "@floating-ui/react";
import { FC } from "react";
import VotingWidgetRewardsProjectionTooltipContent from "../TooltipContent";

interface VotingWidgetRewardsProjectionTooltipProps {
  iconClassName?: string;
  place?: Placement;
}

const VotingWidgetRewardsProjectionTooltip: FC<VotingWidgetRewardsProjectionTooltipProps> = ({
  iconClassName,
  place,
}) => {
  return (
    <HoverInfoTooltip
      ariaLabel="how rewards projection works"
      buttonClassName="text-neutral-14 hover:text-neutral-11"
      iconClassName={iconClassName}
      place={place}
    >
      <VotingWidgetRewardsProjectionTooltipContent />
    </HoverInfoTooltip>
  );
};

export default VotingWidgetRewardsProjectionTooltip;
