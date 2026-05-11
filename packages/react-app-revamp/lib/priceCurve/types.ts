export interface ExponentialPricingInput {
  startPrice: number;
  endPrice: number;
}

export interface LogarithmicPricingInput {
  startPrice: number;
  multiplier: number;
}

export interface PricePointInternal {
  date: Date;
  priceBigInt: bigint;
}

export interface PricePoint {
  date: string; // ISO date string (e.g., "2024-03-13T12:30:00.000Z")
  price: string; // Formatted ETH price (e.g., "0.001", "1.5k", etc.)
}

export interface GeneratePricePointsParams {
  startPrice: number;
  multiple: number;
  startTime: Date;
  endTime: Date;
  updateIntervalSeconds?: number;
}
