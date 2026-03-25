import { create } from "zustand";

interface PriceCurveChartStore {
  showPriceUpdateWarning: boolean;
  setShowPriceUpdateWarning: (show: boolean) => void;
}

const usePriceCurveChartStore = create<PriceCurveChartStore>((set) => ({
  showPriceUpdateWarning: false,
  setShowPriceUpdateWarning: (show: boolean) => set({ showPriceUpdateWarning: show }),
}));

export default usePriceCurveChartStore;
