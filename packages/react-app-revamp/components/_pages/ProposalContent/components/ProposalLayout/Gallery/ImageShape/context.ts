import { createContext, useContext } from "react";

export const MIN_TILE_HEIGHT_RATIO = 1;
export const MAX_TILE_HEIGHT_RATIO = 5 / 4;
export const MAX_TILE_HEIGHT_SPREAD = MAX_TILE_HEIGHT_RATIO / MIN_TILE_HEIGHT_RATIO;

export interface GalleryImageShapeValue {
  isMixed: boolean;
  reportHeightRatio: (heightRatio: number) => void;
}

export const GalleryImageShapeContext = createContext<GalleryImageShapeValue | null>(null);

export const useGalleryImageShape = (): GalleryImageShapeValue | null => useContext(GalleryImageShapeContext);
