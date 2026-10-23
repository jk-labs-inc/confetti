import AmountInput from "@components/HowItWorksExplainer/actors/AmountInput";
import { STAGE_STYLE, type SceneProps } from "@components/HowItWorksExplainer/engine";
import GradientText from "@components/UI/GradientText";
import { FC } from "react";

const PayoutStill: FC<SceneProps> = () => (
  <div style={STAGE_STYLE} className="relative flex flex-col justify-center gap-4 px-6" aria-hidden>
    <AmountInput value="20" />
    <div className="flex flex-col rounded-[16px] border border-white/8 bg-neutral-2 px-4 py-3">
      <GradientText textSizeClassName="text-[12px]" isFontSabo={false}>
        estimated payout
      </GradientText>
      <GradientText textSizeClassName="text-[28px] font-bold" isFontSabo={false}>
        $?
      </GradientText>
    </div>
  </div>
);

export default PayoutStill;
