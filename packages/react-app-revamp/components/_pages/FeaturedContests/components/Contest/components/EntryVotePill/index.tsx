import { CSSProperties, FC, MouseEvent } from "react";

interface EntryVotePillProps {
  percent: number;
  onClick: () => void;
  className?: string;
}

const RING_MASK: CSSProperties = {
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
};

const EntryVotePill: FC<EntryVotePillProps> = ({ percent, onClick, className }) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`group rounded-2xl cursor-pointer ${className ?? ""}`}
      aria-label={`vote — currently ${Math.round(percent)}%`}
    >
      <span className="relative flex items-center justify-center rounded-2xl w-20 h-8 text-base font-bold text-neutral-11 transition-colors duration-200 group-hover:bg-neutral-2">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl p-px bg-gradient-vote-pill-stroke"
          style={RING_MASK}
        />
        {Math.round(percent)}%
      </span>
    </button>
  );
};

export default EntryVotePill;
