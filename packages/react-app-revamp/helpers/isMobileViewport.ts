export const MOBILE_MAX_WIDTH_PX = 767;

export const DESKTOP_HEADER_MIN_WIDTH_PX = 1025;

export const isMobileViewport = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
