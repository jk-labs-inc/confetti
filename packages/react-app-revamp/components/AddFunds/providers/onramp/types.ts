export enum ParaOnrampProvider {
  RAMP = "ramp",
  STRIPE = "stripe",
  MOONPAY = "moonpay",
}

export enum ParaOnrampNetwork {
  ETHEREUM = "ethereum",
  ARBITRUM = "arbitrum",
  BASE = "base",
  POLYGON = "polygon",
  CELO = "celo",
}

export interface OnrampProviderConfig {
  id: ParaOnrampProvider;
  name: string;
  fees: string;
  logo: string;
  logoBorderColor?: string;
  enabled: boolean;
  restrictions?: string;
}

export const ONRAMP_PROVIDERS_CONFIG: OnrampProviderConfig[] = [
  {
    id: ParaOnrampProvider.RAMP,
    name: "ramp",
    fees: "2.5% fees",
    //TODO: add ramp logo?
    logo: "/add-funds/ramp.svg",
    logoBorderColor: "#21bf73",
    enabled: false, // TODO: enable when ready
  },
  {
    id: ParaOnrampProvider.MOONPAY,
    name: "moonpay",
    fees: "2.7% fees",
    logo: "/add-funds/moonpay.svg",
    logoBorderColor: "#7D00FF",
    enabled: false, // TODO: enable when ready
    restrictions: "NY citizens excluded",
  },
  {
    id: ParaOnrampProvider.STRIPE,
    name: "stripe",
    fees: "0.99% fees",
    logo: "/add-funds/stripe.svg",
    logoBorderColor: "#635BFF",
    enabled: true,
  },
];
