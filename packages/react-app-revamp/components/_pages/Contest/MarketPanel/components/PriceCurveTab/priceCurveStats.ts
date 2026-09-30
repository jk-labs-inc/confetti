import { ContestStatus } from "@hooks/useContestStatus/store";

export interface PriceCurveStatData {
  kind: "rise" | "price";
  value: number;
  label: string;
}

interface PriceCurveStatsParams {
  contestStatus: ContestStatus;
  openPrice: number;
  currentPrice: number;
  closePrice: number;
}

const riseFrom = (openPrice: number, price: number): number =>
  openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : 0;

export const buildPriceCurveStats = ({
  contestStatus,
  openPrice,
  currentPrice,
  closePrice,
}: PriceCurveStatsParams): PriceCurveStatData[] => {
  switch (contestStatus) {
    case ContestStatus.VotingOpen:
      return [
        { kind: "rise", value: riseFrom(openPrice, currentPrice), label: "since voting opened" },
        { kind: "price", value: closePrice, label: "per vote at close" },
      ];
    case ContestStatus.VotingClosed:
      return [
        { kind: "rise", value: riseFrom(openPrice, closePrice), label: "from open to close" },
        { kind: "price", value: closePrice, label: "final price per vote" },
      ];
    default:
      return [
        { kind: "price", value: openPrice, label: "per vote when voting opens" },
        { kind: "price", value: closePrice, label: "per vote at close" },
      ];
  }
};
