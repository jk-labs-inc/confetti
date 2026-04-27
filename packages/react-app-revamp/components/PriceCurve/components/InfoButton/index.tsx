import Tooltip from "@components/UI/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useId } from "react";

const InfoButton = () => {
  const id = useId();
  const tooltipId = `price-curve-info-${id}`;

  return (
    <>
      <button
        type="button"
        aria-label="how the price curve works"
        data-tooltip-id={tooltipId}
        data-tooltip-place="right"
        data-tooltip-position-strategy="fixed"
        className="flex items-center justify-center text-neutral-9 hover:text-neutral-11 transition-colors"
      >
        <InformationCircleIcon className="w-5 h-5" />
      </button>
      <Tooltip
        id={tooltipId}
        place="right"
        positionStrategy="fixed"
        className="w-[200px]! md:w-[254px]! rounded-lg! normal-case"
      >
        <div className="text-[12px] text-true-black leading-tight flex flex-col gap-2 normal-case">
          <p className="normal-case">
            <b className="normal-case">The earlier you vote, the more you can earn</b>—by acquiring votes for cheap.
          </p>
          <p className="normal-case">
            But careful. <b className="normal-case">Wait too long, and you might not earn at all</b>… even if you pick a
            winner.
          </p>
        </div>
      </Tooltip>
    </>
  );
};

export default InfoButton;
