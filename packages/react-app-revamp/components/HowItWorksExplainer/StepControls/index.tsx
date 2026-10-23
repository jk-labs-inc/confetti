import { FC } from "react";

interface StepControlsProps {
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
}

const StepControls: FC<StepControlsProps> = ({ isFirst, isLast, onBack, onNext }) => (
  <div className="flex items-center justify-between">
    <button
      type="button"
      onClick={onBack}
      disabled={isFirst}
      className="h-10 px-2 text-[16px] font-bold text-neutral-9 transition-opacity hover:text-neutral-11 disabled:pointer-events-none disabled:opacity-0"
    >
      back
    </button>
    <button
      type="button"
      onClick={onNext}
      className="h-10 min-w-[140px] rounded-[40px] bg-gradient-purple px-6 text-[20px] font-bold text-true-black transition-transform active:scale-[0.97]"
    >
      {isLast ? "let's play" : "next"}
    </button>
  </div>
);

export default StepControls;
