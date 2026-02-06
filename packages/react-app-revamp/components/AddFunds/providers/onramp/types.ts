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
  name: "para",
  description: "stripe and moonpay included",
  logo: "/add-funds/para.svg",
};
