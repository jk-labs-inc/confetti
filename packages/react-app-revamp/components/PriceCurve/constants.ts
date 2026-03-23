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
