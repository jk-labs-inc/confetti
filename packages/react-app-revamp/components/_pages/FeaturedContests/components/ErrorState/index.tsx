import { FC } from "react";

interface FeaturedContestsErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
}

const FeaturedContestsErrorState: FC<FeaturedContestsErrorStateProps> = ({ onRetry, isRetrying }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full lx:w-(--landing-content-max-width) min-h-[220px] md:min-h-[280px] px-6 py-12 rounded-2xl border border-negative-4 bg-negative-1 animate-appear">
      <p className="text-base font-bold text-negative-10 text-center">couldn&apos;t load contests</p>
      <p className="text-sm text-neutral-9 text-center">check your connection and try again</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-2 flex items-center justify-center h-10 px-4 rounded-2xl border border-neutral-7 text-sm font-bold text-neutral-11 hover:border-neutral-10 transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? "retrying..." : "try again"}
      </button>
    </div>
  );
};

export default FeaturedContestsErrorState;
