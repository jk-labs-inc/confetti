import { FC } from "react";

type StickyTriggerKind = "compact" | "rewards" | "chart";

interface ContestStickyTriggerProps {
  trigger: StickyTriggerKind;
}

const ContestStickyTrigger: FC<ContestStickyTriggerProps> = ({ trigger }) => {
  return <div data-sticky-marker={trigger} aria-hidden className="h-px w-full" />;
};

export default ContestStickyTrigger;
