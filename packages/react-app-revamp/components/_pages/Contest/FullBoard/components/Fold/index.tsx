import { FC } from "react";

interface FoldProps {
  hiddenCount: number;
  fromRank: number;
  toRank: number;
  onExpand: () => void;
}

const Fold: FC<FoldProps> = ({ hiddenCount, fromRank, toRank, onExpand }) => (
  <button
    type="button"
    onClick={onExpand}
    className="self-start py-2 text-[12px] font-semibold text-neutral-9 transition-colors hover:text-neutral-11"
  >
    show {hiddenCount} more (#{fromRank}–#{toRank}) <span aria-hidden>⌄</span>
  </button>
);

export default Fold;
