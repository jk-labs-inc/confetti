import { FC } from "react";

interface VoterRibbonHeaderProps {
  isLive: boolean;
  onViewAll?: () => void;
}

const VoterRibbonHeader: FC<VoterRibbonHeaderProps> = ({ isLive, onViewAll }) => (
  <div className="flex items-center gap-2 px-0.5 pb-1.5">
    {isLive ? (
      <span className="relative flex size-[7px] flex-none">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive-10 opacity-75" />
        <span className="relative inline-flex size-[7px] rounded-full bg-positive-11" />
      </span>
    ) : (
      <span className="size-[7px] flex-none rounded-full bg-secondary-11" />
    )}
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
