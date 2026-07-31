import HoverInfoTooltip from "@components/UI/HoverInfoTooltip";
import { FC } from "react";

interface WouldWinNowTooltipProps {
  isBelowSpend: boolean;
  iconClassName?: string;
}

const WouldWinNowTooltip: FC<WouldWinNowTooltipProps> = ({ isBelowSpend, iconClassName }) => {
  return (
    <HoverInfoTooltip
      ariaLabel="how would win now works"
      buttonClassName="text-neutral-14 hover:text-neutral-11"
      tooltipClassName="max-w-[250px]"
      iconClassName={iconClassName}
    >
      <p>
        {isBelowSpend ? (
          <>
            note: you would earn less than you're spending if the contest ends right now because you're paying a high
            price for a small share of the pool.
          </>
        ) : (
          <>if the contest ended now, this is how much you'd win. actual amount may be lower or higher.</>
        )}
      </p>
    </HoverInfoTooltip>
  );
};

export default WouldWinNowTooltip;
