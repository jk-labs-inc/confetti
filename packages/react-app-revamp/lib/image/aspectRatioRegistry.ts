const widthOverHeightBySrc = new Map<string, number>();

export const rememberImageAspectRatio = (src: string, widthOverHeight: number): void => {
  widthOverHeightBySrc.set(src.trim(), widthOverHeight);
};

export const recallImageAspectRatio = (src: string): number | undefined => widthOverHeightBySrc.get(src.trim());
