import { create } from "zustand";

interface PriceCurveChartStore {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  showPriceUpdateWarning: boolean;
  setShowPriceUpdateWarning: (show: boolean) => void;
}

const usePriceCurveChartStore = create<PriceCurveChartStore>((set) => ({
  isExpanded: true,
  setIsExpanded: (isExpanded: boolean) => set({ isExpanded }),
  showPriceUpdateWarning: false,
  setShowPriceUpdateWarning: (show: boolean) => set({ showPriceUpdateWarning: show }),
}));

export default usePriceCurveChartStore;