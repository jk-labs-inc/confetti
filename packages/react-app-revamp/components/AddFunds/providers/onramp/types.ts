/**
 * Supported networks for Para onramp
 */
export enum ParaOnrampNetwork {
  ETHEREUM = "ethereum",
  ARBITRUM = "arbitrum",
  BASE = "base",
  POLYGON = "polygon",
  CELO = "celo",
}

/**
 * Para onramp provider configuration
 * Para is the wallet manager that handles onramping through Stripe and MoonPay
 */
export interface ParaOnrampConfig {
  name: string;
  description: string;
  logo: string;
}

export const PARA_ONRAMP_CONFIG: ParaOnrampConfig = {
  name: "moonpay",
  description: "better for non-americans | $20 min",
  logo: "/add-funds/moonpay.svg",
};
