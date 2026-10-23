import AmountInput from "@components/HowItWorksExplainer/actors/AmountInput";
import { STAGE_STYLE, type SceneProps } from "@components/HowItWorksExplainer/engine";
import { FC } from "react";

const LateStill: FC<SceneProps> = () => (
  <div style={STAGE_STYLE} className="relative flex flex-col justify-center gap-4 px-6" aria-hidden>
    <AmountInput value="20" />
    <div className="flex flex-col rounded-[16px] border border-negative-11/40 bg-neutral-2 px-4 py-3">
      <span className="text-[12px] text-neutral-9">estimated payout</span>
      <span className="text-[28px] font-bold leading-tight text-negative-11">less than $20</span>
    </div>
  </div>
);

export default LateStill;
