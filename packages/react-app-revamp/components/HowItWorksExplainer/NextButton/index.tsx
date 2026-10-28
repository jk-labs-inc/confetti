import PixelArrow from "@components/HowItWorksExplainer/PixelArrow";
import GradientText from "@components/UI/GradientText";
import { FC } from "react";

interface NextButtonProps {
  isLast: boolean;
  onNext: () => void;
}

const NextButton: FC<NextButtonProps> = ({ isLast, onNext }) => (
  <button
    type="button"
    onClick={onNext}
    aria-label={isLast ? undefined : "next step"}
    className={`group flex h-8 shrink-0 items-center justify-center gap-1.5 transition-colors ${
      isLast ? "whitespace-nowrap text-neutral-11 hover:opacity-80" : "w-8 text-neutral-9 hover:text-neutral-11"
    }`}
  >
    {isLast && (
      <GradientText textSizeClassName="text-[16px] font-bold" isFontSabo={false}>
        let&apos;s play
      </GradientText>
    )}
    <span className="block transition-transform group-hover:translate-x-0.5">
      <PixelArrow direction="right" sizePx={16} />
    </span>
  </button>
);

export default NextButton;
