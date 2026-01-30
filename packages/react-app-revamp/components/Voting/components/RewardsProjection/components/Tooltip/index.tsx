import Tooltip from "@components/UI/Tooltip";
import { FC } from "react";

interface VotingWidgetRewardsProjectionTooltipProps {
  tooltipId: string;
}

const LINK_MATH_DOCS = "https://docs.confetti.win/calculating-roi";

const VotingWidgetRewardsProjectionTooltip: FC<VotingWidgetRewardsProjectionTooltipProps> = ({ tooltipId }) => {
  return (
    <Tooltip id={tooltipId}>
      <p className="text-[12px] text-true-black">
        <b>this is the most you could make</b> in an <br />
        ideal outcome.{" "}
        <a className="italic underline underline-offset-3 decoration-positive-11" href={LINK_MATH_DOCS} target="_blank">
          read here{" "}
        </a>
        about math <br />
        calculations to estimate your earnings
      </p>
    </Tooltip>
  );
};

export default VotingWidgetRewardsProjectionTooltip;
