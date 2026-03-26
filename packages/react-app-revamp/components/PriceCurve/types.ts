export interface ChartDataPoint {
  id: string;
  date: string;
  pv: number;
}

export interface PriceCurveChartProps {
  data: ChartDataPoint[];
  currentPrice: number;
  currentIndex: number;
}

export interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}
