import { DEFAULT_MULTIPLIERS } from "@hooks/useDeployContest/slices/contestMonetizationSlice";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import CurveIcon from "./components/CurveIcon";
import { CURVE_TYPE_OPTIONS } from "./constants";

const PriceCurveTypeSelector: FC = () => {
  const { selectedType, setPriceCurve } = useDeployContestStore(
    useShallow(state => ({
      selectedType: state.priceCurve.type,
      setPriceCurve: state.setPriceCurve,
    })),
  );

  const handleSelect = (type: PriceCurveType) => {
    if (type === selectedType) return;
    setPriceCurve(prev => ({
      ...prev,
      type,
      multipler: DEFAULT_MULTIPLIERS[type],
    }));
  };

  return (
    <div className="flex flex-col gap-8 pl-6">
      <p className="text-[20px] text-neutral-11">what kind of price curve would you like for your contest?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[560px]">
        {CURVE_TYPE_OPTIONS.map(option => {
          const isSelected = option.type === selectedType;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => handleSelect(option.type)}
              aria-pressed={isSelected}
              className={`flex flex-col gap-3 rounded-2xl border p-4 text-center transition-colors duration-150 ${
                isSelected ? "border-neutral-11 bg-true-black" : "border-neutral-2 bg-true-black hover:border-neutral-9"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <p className={`text-[18px] font-bold ${isSelected ? "text-neutral-11" : "text-neutral-9"}`}>
                  {option.title}
                </p>
                <p className="text-[14px] text-neutral-9">{option.description}</p>
              </div>
              <CurveIcon type={option.type} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PriceCurveTypeSelector;
