import { chains } from "@config/wagmi";
import { darkTheme, NATIVE_TOKEN } from "@funkit/connect";
import type { FunkitCheckoutConfig, FunkitConfig } from "@funkit/connect";

const FUNKIT_API_KEY = process.env.NEXT_PUBLIC_FUNKIT_API_KEY ?? "";

export const isFunkitConfigured = FUNKIT_API_KEY !== "";

export const funkitConfig: FunkitConfig = {
  apiKey: FUNKIT_API_KEY,
  appName: "Confetti",
  source: "confetti.win",
  uiCustomizations: {
    alignTitle: "left",
  },
};

export const funkitTheme = darkTheme({
  customColors: {
    activeTabBackground: "#BB66FF",
    buttonBackground: "#67DEFF",
  },
});

const FUNKIT_SUPPORTED_CHAIN_IDS = new Set([137]);

export const getFunkitChain = (chainName: string) => {
  if (!isFunkitConfigured) return undefined;
  const normalized = chainName.toLowerCase().replace(/\s/g, "");
  const chain = chains.find(c => c.name.toLowerCase().replace(/\s/g, "") === normalized);
  if (!chain || !FUNKIT_SUPPORTED_CHAIN_IDS.has(chain.id)) return undefined;
  return chain;
};

export const buildFunkitCheckoutConfig = (chainName: string): FunkitCheckoutConfig | undefined => {
  const chain = getFunkitChain(chainName);
  if (!chain) return undefined;

  return {
    modalTitle: "add funds",
    checkoutItemTitle: chain.nativeCurrency.symbol,
    targetChain: String(chain.id),
    targetAsset: NATIVE_TOKEN,
    targetAssetTicker: chain.nativeCurrency.symbol,
    targetAssetAmount: 0,
    iconSrc: chain.iconUrl,
  };
};
