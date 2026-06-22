import { FC } from "react";

interface VoterRibbonHeaderProps {
  onViewAll?: () => void;
}

const VoterRibbonHeader: FC<VoterRibbonHeaderProps> = ({ onViewAll }) => (
  <div className="flex items-center gap-2 px-0.5 pb-1.5">
    <span className="size-[7px] flex-none rounded-full bg-secondary-11" />
    <span className="text-[14px] font-bold text-neutral-11">activity feed</span>
    {onViewAll && (
      <button
        type="button"
        onClick={onViewAll}
        className="ml-auto flex items-center gap-1 rounded-full bg-neutral-4 px-2.5 py-1 text-[12px] font-semibold text-neutral-9"
      >
        view all <span aria-hidden>›</span>
      </button>
    )}
  </div>
);

export default VoterRibbonHeader;
