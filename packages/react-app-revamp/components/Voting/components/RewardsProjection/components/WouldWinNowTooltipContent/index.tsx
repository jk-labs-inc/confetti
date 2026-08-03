import { FC } from "react";

interface WouldWinNowTooltipContentProps {
  isBelowSpend: boolean;
}

const WouldWinNowTooltipContent: FC<WouldWinNowTooltipContentProps> = ({ isBelowSpend }) => {
  return (
    <p>
      {isBelowSpend ? (
        <>
          note: you would take home less than you're spending if the contest ends right now because you're paying a high
          price for a small share of the pool.
        </>
      ) : (
        <>if the contest ended now, this is how much you'd take home. actual amount may be lower or higher.</>
      )}
    </p>
  );
};

export default WouldWinNowTooltipContent;
