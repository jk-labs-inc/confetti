import { preloadHowItWorks } from "@components/HowItWorksExplainer/Loader";
import { useHowItWorksStore } from "@components/HowItWorksExplainer/store";
import { FC } from "react";

export type HowItWorksTriggerSize = "sm" | "md";

interface HowItWorksTriggerProps {
  size?: HowItWorksTriggerSize;
}

const SIZE_CLASS_NAME: Record<HowItWorksTriggerSize, string> = {
  sm: "h-7 px-2.5 text-[12px]",
  md: "h-8 px-4 text-base",
};

const HowItWorksTrigger: FC<HowItWorksTriggerProps> = ({ size = "md" }) => {
  const open = useHowItWorksStore(state => state.open);

  return (
    <button
      type="button"
      onClick={open}
      onPointerEnter={preloadHowItWorks}
      onPointerDown={preloadHowItWorks}
      onFocus={preloadHowItWorks}
      className={`shrink-0 whitespace-nowrap rounded-[40px] border border-neutral-10 bg-true-black font-bold text-neutral-11 transition-colors hover:border-neutral-9 ${SIZE_CLASS_NAME[size]}`}
    >
      how it works
    </button>
  );
};

export default HowItWorksTrigger;
