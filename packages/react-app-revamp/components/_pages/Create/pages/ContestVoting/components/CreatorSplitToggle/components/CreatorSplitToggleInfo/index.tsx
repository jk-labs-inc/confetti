import Tooltip from "@components/UI/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const TOOLTIP_ID = "creator-split-toggle-info-tooltip";

const CreatorSplitToggleInfo = () => {
  return (
    <div className="hidden md:flex flex-col">
      <InformationCircleIcon
        className="text-neutral-14 w-5 h-5"
        data-tooltip-id={TOOLTIP_ID}
        data-tooltip-place="right"
      />
      <Tooltip id={TOOLTIP_ID}>
        <p className="text-xs text-true-black normal-case">
          Confetti takes a 10% cut that <br /> helps prevent whale <br /> manipulation. toggle this, and <br /> we’ll
          split it with you.
        </p>
      </Tooltip>
    </div>
  );
};

export default CreatorSplitToggleInfo;
