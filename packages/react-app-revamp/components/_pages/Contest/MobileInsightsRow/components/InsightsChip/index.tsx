import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

const InsightsChip: FC = () => (
  <span className="mr-1 flex h-7 shrink-0 items-center gap-0.5 rounded-full bg-neutral-4 pl-3 pr-2 text-[12px] font-bold text-neutral-11">
    insights
    <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
  </span>
);

export default InsightsChip;
