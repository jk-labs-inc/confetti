import { FC } from "react";

const GhostChip: FC = () => (
  <div className="flex w-[176px] shrink-0 flex-col gap-[9px] rounded-[15px] border border-dashed border-neutral-4 p-[11px]">
    <div className="flex items-center gap-2">
      <span className="h-6 w-6 shrink-0 rounded-full bg-neutral-3" />
      <span className="h-2.5 w-20 rounded-full bg-neutral-3" />
    </div>
    <span className="h-3.5 w-16 rounded-full bg-neutral-3" />
    <span className="h-2 w-24 rounded-full bg-neutral-3" />
  </div>
);

export default GhostChip;
