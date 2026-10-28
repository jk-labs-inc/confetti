import { FC } from "react";
import type { HowItWorksStep } from "lib/howItWorks/types";

interface StepCopyProps {
  step: Pick<HowItWorksStep, "headline" | "body">;
}

const StepCopy: FC<StepCopyProps> = ({ step }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[20px] font-bold text-neutral-11">{step.headline}</p>
    {step.body && (
      <p className="text-[16px] text-neutral-9">
        {step.body.map((part, i) => (typeof part === "string" ? part : <em key={i}>{part.emphasis}</em>))}
      </p>
    )}
  </div>
);

export default StepCopy;
