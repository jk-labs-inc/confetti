import { FC } from "react";

interface EntryRankCircleProps {
  rank: number;
  className?: string;
}

const EntryRankCircle: FC<EntryRankCircleProps> = ({ rank, className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-true-black/70 font-bold tabular-nums text-neutral-11 ${className}`}
  >
    {rank}
  </div>
);

export default EntryRankCircle;
