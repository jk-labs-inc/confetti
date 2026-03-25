export const MARGIN = { top: 40, right: 120, left: 35, bottom: 80 };

export const CHART_CONFIG = {
  verticalGridSections: 6,
  colors: {
    grid: "#3D3D3D",
    border: "#ffffff",
    mainLine: "#BB65FF",
    activeDot: "#22d3ee",
    hoverLine: "#ffffff",
  },
  animation: {
    dot: {
      stiffness: 300,
      damping: 35,
    },
    referenceLines: {
      stiffness: 250,
      damping: 30,
    },
    dotScale: {
      stiffness: 400,
      damping: 25,
    },
  },
} as const;

export const CARD_PADDING = { top: 24, right: 32, bottom: 24, left: 32 };
export const CARD_PADDING_STYLE = {
  padding: `${CARD_PADDING.top}px ${CARD_PADDING.right}px ${CARD_PADDING.bottom}px ${CARD_PADDING.left}px`,
};
export const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };
export const HEADER_HEIGHT = 48;
export const CHART_PADDING = { top: 22, right: 8, left: 8, bottom: 24 };
export const CHART_PADDING_WITH_LABELS = { top: 22, right: 60, left: 8, bottom: 36 };
export const GRID_LINE_COUNT = 5;
export const SVG_OVERFLOW_STYLE = { overflow: "visible" } as const;
export const TOUCH_PAN_STYLE = { touchAction: "pan-y" } as const;

export const PARTICLE_SVGS = [
  "/particles/confetti-pink.svg",
  "/particles/confetti-purple.svg",
  "/particles/confetti-cyan.svg",
  "/particles/confetti-green.svg",
  "/particles/confetti-violet.svg",
];
