import { rememberImageAspectRatio } from "lib/image/aspectRatioRegistry";
import { SyntheticEvent, useCallback, useState } from "react";
import { MAX_TILE_HEIGHT_RATIO, MIN_TILE_HEIGHT_RATIO, useGalleryImageShape } from "./context";

const clampHeightRatio = (heightRatio: number): number =>
  Math.min(Math.max(heightRatio, MIN_TILE_HEIGHT_RATIO), MAX_TILE_HEIGHT_RATIO);

export const useGalleryTileShape = (src: string) => {
  const shape = useGalleryImageShape();
  const reportHeightRatio = shape?.reportHeightRatio;
  const [heightRatio, setHeightRatio] = useState<number | null>(null);

  const onImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      if (!naturalWidth || !naturalHeight) return;
      const loadedHeightRatio = naturalHeight / naturalWidth;
      rememberImageAspectRatio(src, naturalWidth / naturalHeight);
      setHeightRatio(loadedHeightRatio);
      reportHeightRatio?.(loadedHeightRatio);
    },
    [reportHeightRatio, src],
  );

  const cropHeightRatio = shape?.isMixed && heightRatio !== null ? clampHeightRatio(heightRatio) : undefined;

  return { onImageLoad, cropHeightRatio };
};
