export interface ContestProfitData {
  isAnalyticsSupported: boolean;
  profitPercentage: number;
  isInProfit: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
