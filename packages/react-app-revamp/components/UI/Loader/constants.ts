export const FRAME_COUNT = 5;
export const CYCLE_DURATION_MS = 600;

export const FRAME_URLS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/confetti/loader/frame-${i + 1}.svg`,
);
