import { FC } from "react";
import { useEntriesBelowFold } from "../useEntriesBelowFold";

interface EntriesBelowFoldHintProps {
  scrollRoot: HTMLElement | null;
}

const EntriesBelowFoldHint: FC<EntriesBelowFoldHintProps> = ({ scrollRoot }) => {
  const below = useEntriesBelowFold(scrollRoot);

  if (below === 0) return null;

  return (
    <div className="shrink-0 mt-auto pt-2 border-t border-neutral-4">
      <p className="text-[11px] text-neutral-9 text-center">
        {below} more {below === 1 ? "entry" : "entries"} below
      </p>
    </div>
  );
};

export default EntriesBelowFoldHint;
