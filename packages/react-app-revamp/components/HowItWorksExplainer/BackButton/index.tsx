import PixelArrow from "@components/HowItWorksExplainer/PixelArrow";
import { FC } from "react";

interface BackButtonProps {
  isHidden: boolean;
  onBack: () => void;
}

const BackButton: FC<BackButtonProps> = ({ isHidden, onBack }) => (
  <button
    type="button"
    onClick={onBack}
    disabled={isHidden}
    aria-label="previous step"
    className={`flex size-8 shrink-0 items-center justify-center text-neutral-9 transition-colors hover:text-neutral-11 ${
      isHidden ? "invisible" : ""
    }`}
  >
    <PixelArrow direction="left" sizePx={16} />
  </button>
);

export default BackButton;
