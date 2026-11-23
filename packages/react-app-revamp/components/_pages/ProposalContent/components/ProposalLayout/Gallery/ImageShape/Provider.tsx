import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { GalleryImageShapeContext, GalleryImageShapeValue, MAX_TILE_HEIGHT_SPREAD } from "./context";

interface HeightRatioRange {
  min: number;
  max: number;
}

interface GalleryImageShapeProviderProps {
  initialHeightRatios?: number[];
  children: ReactNode;
}

const NO_HEIGHT_RATIOS: number[] = [];

const rangeOf = (heightRatios: number[]): HeightRatioRange | null =>
  heightRatios.length ? { min: Math.min(...heightRatios), max: Math.max(...heightRatios) } : null;

const GalleryImageShapeProvider: FC<GalleryImageShapeProviderProps> = ({
  initialHeightRatios = NO_HEIGHT_RATIOS,
  children,
}) => {
  const [range, setRange] = useState<HeightRatioRange | null>(() => rangeOf(initialHeightRatios));

  const reportHeightRatio = useCallback((heightRatio: number) => {
    setRange(prev => {
      if (!prev) return { min: heightRatio, max: heightRatio };
      if (heightRatio >= prev.min && heightRatio <= prev.max) return prev;
      return { min: Math.min(prev.min, heightRatio), max: Math.max(prev.max, heightRatio) };
    });
  }, []);

  const isMixed = !!range && range.max / range.min > MAX_TILE_HEIGHT_SPREAD;
  const value = useMemo<GalleryImageShapeValue>(() => ({ isMixed, reportHeightRatio }), [isMixed, reportHeightRatio]);

  return <GalleryImageShapeContext.Provider value={value}>{children}</GalleryImageShapeContext.Provider>;
};

export default GalleryImageShapeProvider;
