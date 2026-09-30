import { FC } from "react";

interface EntryVoterShareBarProps {
  fraction: number;
  isViewer: boolean;
}

const EntryVoterShareBar: FC<EntryVoterShareBarProps> = ({ fraction, isViewer }) => (
  <div className="h-1 w-full overflow-hidden rounded-full bg-primary-2">
    <div
      className={`h-full rounded-full ${isViewer ? "bg-secondary-11" : "bg-neutral-12"}`}
      style={{ width: `${Math.min(100, Math.max(0, fraction * 100))}%` }}
    />
  </div>
);

export default EntryVoterShareBar;
