import { VotingWidgetLayout } from "@components/Voting/types";

interface ProjectionLayoutClassNames {
  container: string;
  labelRow: string;
  label: string;
  value: string;
  icon?: string;
}

export const PROJECTION_LAYOUT_CLASS_NAMES: Record<VotingWidgetLayout, ProjectionLayoutClassNames> = {
  [VotingWidgetLayout.regular]: {
    container: "gap-4 py-3 pl-4 pr-6",
    labelRow: "gap-2",
    label: "text-[16px]",
    value: "text-[24px]",
  },
  [VotingWidgetLayout.compact]: {
    container: "gap-3 py-2.5 px-3",
    labelRow: "gap-1",
    label: "text-[12px] whitespace-nowrap",
    value: "text-[18px]",
    icon: "h-3.5 w-3.5",
  },
};
