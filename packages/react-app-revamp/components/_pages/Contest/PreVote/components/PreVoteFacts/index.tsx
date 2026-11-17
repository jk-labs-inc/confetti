import CompactAmount from "@components/UI/CompactAmount";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import usePriceCurveConfig from "@hooks/usePriceCurveConfig";
import { FC } from "react";

interface PreVoteFactsProps {
  isPriceCurveOpen: boolean;
  priceCurvePanelId: string;
  onTogglePriceCurve: () => void;
}

const VALUE_CLASS_NAME = "font-bold text-neutral-11";

const PreVoteFacts: FC<PreVoteFactsProps> = ({ isPriceCurveOpen, priceCurvePanelId, onTogglePriceCurve }) => {
  const isSubmissionOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.SubmissionOpen;
  const { chartData, isLoading, isError } = usePriceCurveConfig();
  const formatPrice = useNativePriceFormatter();
  const startPrice = chartData[0]?.pv;
  const endPrice = chartData[chartData.length - 1]?.pv;
  const hasPriceRange = !isLoading && !isError && startPrice !== undefined && endPrice !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap text-[14px] text-neutral-9">
      {isSubmissionOpen ? (
        <span className="flex items-center gap-2 font-bold text-positive-11">
          <span aria-hidden="true" className="size-2 rounded-full bg-positive-11" />
          entries open
        </span>
      ) : (
        <span>entries not open yet</span>
      )}
      {hasPriceRange && (
        <>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onTogglePriceCurve}
            aria-expanded={isPriceCurveOpen}
            aria-controls={priceCurvePanelId}
            className="flex items-center gap-1.5 normal-case transition-colors duration-150 hover:text-neutral-11"
          >
            <span>
              <b className={VALUE_CLASS_NAME}>
                <CompactAmount value={formatPrice(startPrice, { ceilingPrecision: true })} /> →{" "}
                <CompactAmount value={formatPrice(endPrice, { ceilingPrecision: true })} />
              </b>{" "}
              per vote
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              strokeWidth={2.5}
              className={`h-3.5 w-3.5 text-neutral-11 transition-transform duration-200 ${isPriceCurveOpen ? "rotate-180" : ""}`}
            />
          </button>
        </>
      )}
    </div>
  );
};

export default PreVoteFacts;
