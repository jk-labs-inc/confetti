import HoverInfoTooltip from "@components/UI/HoverInfoTooltip";

const LINK_MATH_DOCS = "https://docs.confetti.win/calculating-roi";

const VotingWidgetRewardsProjectionTooltip = () => {
  return (
    <HoverInfoTooltip
      ariaLabel="how rewards projection works"
      buttonClassName="text-neutral-14 hover:text-neutral-11"
    >
      <p>
        <b>this is the most you could make</b> in an <br />
        ideal outcome.{" "}
        <a
          className="italic underline underline-offset-3 decoration-positive-11"
          href={LINK_MATH_DOCS}
          target="_blank"
          rel="noopener noreferrer"
        >
          read here{" "}
        </a>
        about math <br />
        calculations to estimate your earnings
      </p>
    </HoverInfoTooltip>
  );
};

export default VotingWidgetRewardsProjectionTooltip;
