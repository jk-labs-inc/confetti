import { PriceCurveType } from "@hooks/useDeployContest/types";

export interface CurveTypeOption {
  type: PriceCurveType;
  title: string;
  description: string;
  descriptionMobile: string;
}

export const CURVE_TYPE_OPTIONS: CurveTypeOption[] = [
  {
    type: PriceCurveType.Exponential,
    title: "exponential",
    description: "maximizes fun as drama accelerates",
    descriptionMobile: "maximizes drama at end",
  },
  {
    type: PriceCurveType.Logarithmic,
    title: "logarithmic",
    description: "maximizes early conviction voting",
    descriptionMobile: "maximizes early voting",
  },
];

// SVG path data for the curve previews. ViewBox is 100x60 in each card.
// Curves go from bottom-left to top-right; the dot sits at the end.
export const CURVE_PATHS: Record<PriceCurveType, { path: string; dot: { x: number; y: number } }> = {
  [PriceCurveType.Exponential]: {
    path: "M 8 52 C 38 54, 60 50, 86 10",
    dot: { x: 86, y: 10 },
  },
  [PriceCurveType.Logarithmic]: {
    path: "M 8 52 C 18 18, 50 8, 86 10",
    dot: { x: 86, y: 10 },
  },
};
