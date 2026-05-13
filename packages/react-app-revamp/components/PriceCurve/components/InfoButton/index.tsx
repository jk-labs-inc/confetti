import HoverInfoTooltip from "@components/UI/HoverInfoTooltip";

const InfoButton = () => {
  return (
    <HoverInfoTooltip
      ariaLabel="how the price curve works"
      contentClassName="text-[12px] text-true-black leading-tight flex flex-col gap-2 normal-case"
      tooltipClassName="w-[200px]! md:w-[254px]! rounded-lg! normal-case"
      tooltipStyle={{ padding: 8 }}
    >
      <p className="normal-case">
        <b className="normal-case">The earlier you vote, the more you can earn</b>—by acquiring votes for cheap.
      </p>
      <p className="normal-case">
        But careful. <b className="normal-case">Wait too long, and you might not earn at all</b>… even if you pick a
        winner. Check math{" "}
        <a
          href="https://docs.confetti.win/calculating-roi"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold normal-case"
        >
          here
        </a>
        .
      </p>
    </HoverInfoTooltip>
  );
};

export default InfoButton;
