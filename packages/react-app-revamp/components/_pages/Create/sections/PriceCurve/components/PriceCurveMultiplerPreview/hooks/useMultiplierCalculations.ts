import {
  DEFAULT_MULTIPLIERS,
  MULTIPLIER_RANGES,
  validateMultiplier,
} from "@hooks/useDeployContest/slices/contestMonetizationSlice";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { Charge, PriceCurve, PriceCurveType } from "@hooks/useDeployContest/types";
import { calculateExponentialMultiple, calculateLogarithmicMultiple } from "lib/priceCurve";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

const calculatePricesAndMultiple = (
  type: PriceCurveType,
  startPrice: number,
  multipler: number,
  setCharge: (updater: Charge | ((prev: Charge) => Charge)) => void,
  setPriceCurve: (updater: PriceCurve | ((prev: PriceCurve) => PriceCurve)) => void,
) => {
  if (!startPrice || startPrice <= 0) return;

  try {
    if (type === PriceCurveType.Logarithmic) {
      const multiple = calculateLogarithmicMultiple({
        startPrice,
        multiplier: multipler,
      });

      const endPrice = startPrice * multipler;

      setCharge((prev: Charge) => ({
        ...prev,
        costToVote: startPrice,
        costToVoteEndPrice: endPrice,
      }));

      setPriceCurve((prev: PriceCurve) => ({
        ...prev,
        multiple,
      }));
      return;
    }

    const endPrice = startPrice * multipler;
    const multiple = calculateExponentialMultiple({
      startPrice,
      endPrice,
    });

    setCharge((prev: Charge) => ({
      ...prev,
      costToVote: startPrice,
      costToVoteEndPrice: endPrice,
    }));

    setPriceCurve((prev: PriceCurve) => ({
      ...prev,
      multiple,
    }));
  } catch (error) {
    console.error("Error calculating price curve multiple:", error);
  }
};

export const useMultiplierCalculations = (onError?: (hasError: boolean) => void) => {
  const { type, multipler, costToVote, setCharge, setPriceCurve } = useDeployContestStore(
    useShallow(state => ({
      type: state.priceCurve.type,
      multipler: state.priceCurve.multipler,
      costToVote: state.charge.costToVote,
      setCharge: state.setCharge,
      setPriceCurve: state.setPriceCurve,
    })),
  );

  const [errorMessage, setErrorMessage] = useState("");
  const hasInitialized = useRef(false);
  const prevTypeRef = useRef<PriceCurveType>(type);

  useEffect(() => {
    if (hasInitialized.current || !costToVote || costToVote <= 0) return;

    hasInitialized.current = true;

    const error = validateMultiplier(multipler, type);
    if (error) {
      setErrorMessage(error);
      onError?.(true);
      return;
    }

    calculatePricesAndMultiple(type, costToVote, multipler, setCharge, setPriceCurve);
  }, [costToVote, multipler, type, setCharge, setPriceCurve, onError]);

  // When the curve type changes, clamp the multipler if it falls outside the new range
  // and recompute prices.
  useEffect(() => {
    if (prevTypeRef.current === type) return;
    prevTypeRef.current = type;

    if (!costToVote || costToVote <= 0) return;

    const range = MULTIPLIER_RANGES[type];
    const nextMultipler = multipler < range.min || multipler > range.max ? DEFAULT_MULTIPLIERS[type] : multipler;

    if (nextMultipler !== multipler) {
      setPriceCurve(prev => ({
        ...prev,
        multipler: nextMultipler,
      }));
    }

    const error = validateMultiplier(nextMultipler, type);
    setErrorMessage(error);
    onError?.(!!error);

    calculatePricesAndMultiple(type, costToVote, nextMultipler, setCharge, setPriceCurve);
  }, [type, costToVote, multipler, setCharge, setPriceCurve, onError]);

  const handleMultiplierChange = (value: number) => {
    setPriceCurve(prev => ({
      ...prev,
      multipler: value,
    }));

    const error = validateMultiplier(value, type);
    setErrorMessage(error);
    onError?.(!!error);

    if (costToVote > 0) {
      calculatePricesAndMultiple(type, costToVote, value, setCharge, setPriceCurve);
    }
  };

  return {
    multipler,
    errorMessage,
    handleMultiplierChange,
  };
};
