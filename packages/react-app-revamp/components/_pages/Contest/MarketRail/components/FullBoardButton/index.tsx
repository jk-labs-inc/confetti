import { FC } from "react";

export type FullBoardButtonVariant = "pill" | "label";

interface FullBoardButtonProps {
  variant?: FullBoardButtonVariant;
  label?: string;
  onClick: () => void;
}

const VARIANT_CLASS_NAME: Record<FullBoardButtonVariant, string> = {
  label:
    "shrink-0 text-[10.5px] wide:text-[11px] font-semibold text-neutral-11 transition-colors hover:text-true-white",
  pill: "shrink-0 rounded-full bg-neutral-4 px-2.5 py-1 text-[12px] font-semibold text-neutral-9 transition-colors hover:text-neutral-11",
};

const FullBoardButton: FC<FullBoardButtonProps> = ({ variant = "pill", label = "see all", onClick }) => (
  <button type="button" onClick={onClick} className={VARIANT_CLASS_NAME[variant]}>
    {label} <span aria-hidden>›</span>
  </button>
);

export default FullBoardButton;
