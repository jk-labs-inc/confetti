export const MOBILE_MAX_WIDTH_PX = 767;

export const isMobileViewport = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
