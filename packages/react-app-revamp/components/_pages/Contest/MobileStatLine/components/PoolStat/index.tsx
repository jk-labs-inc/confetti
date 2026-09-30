import { ContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";

interface PoolStatProps {
  pool: ContestPoolDisplay;
}

const PoolStat: FC<PoolStatProps> = ({ pool }) => {
  if (pool.isLoading && !pool.amountLabel) {
    return <span className="h-3.5 w-24 shrink-0 animate-pulse rounded-full bg-neutral-2" />;
  }

  return (
    <span className="min-w-0 truncate">
      <b className="font-bold text-neutral-11">{pool.amountLabel}</b> to {pool.recipientsLabel}
    </span>
  );
};

export default PoolStat;
