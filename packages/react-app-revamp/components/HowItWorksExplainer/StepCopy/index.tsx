import type { HowItWorksStep } from "lib/howItWorks/steps";
import { FC } from "react";

interface StepCopyProps {
  step: Pick<HowItWorksStep, "headline" | "body">;
}

const StepCopy: FC<StepCopyProps> = ({ step }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[20px] font-bold text-neutral-11">{step.headline}</p>
    <p className="text-[16px] text-neutral-9">{step.body}</p>
  </div>
);

export default StepCopy;
