import { FC, ReactNode } from "react";

interface MarketPanelEmptyStateProps {
  title: string;
  hint: string;
  slots: ReactNode;
}

const GHOST_FADE = "linear-gradient(to right, rgba(0,0,0,0.9), transparent 85%)";

const MarketPanelEmptyState: FC<MarketPanelEmptyStateProps> = ({ title, hint, slots }) => (
  <div className="flex items-center gap-5">
    <div className="flex shrink-0 flex-col gap-1 normal-case">
      <p className="text-[14px] font-semibold text-neutral-11">{title}</p>
      <p className="max-w-[220px] text-[12px] text-neutral-9">{hint}</p>
    </div>
    <div
      aria-hidden
      className="flex min-w-0 flex-1 gap-2 overflow-hidden"
      style={{ maskImage: GHOST_FADE, WebkitMaskImage: GHOST_FADE }}
    >
      {slots}
    </div>
  </div>
);

export default MarketPanelEmptyState;
