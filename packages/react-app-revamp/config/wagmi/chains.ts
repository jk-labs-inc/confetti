import { Chain, Transport, fallback, http } from "viem";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { abstract } from "./custom-chains/abstract";
import { arbitrumOne } from "./custom-chains/arbitrumOne";
import { avalanche } from "./custom-chains/avalanche";
import { base } from "./custom-chains/base";
import { baseTestnet } from "./custom-chains/baseTestnet";
import { celo } from "./custom-chains/celo";
import { cyber } from "./custom-chains/cyber";
import { forma } from "./custom-chains/forma";
import { hyperliquid } from "./custom-chains/hyperliquid";
import { ink } from "./custom-chains/ink";
import { kub } from "./custom-chains/kub";
import { linea } from "./custom-chains/linea";
import { mainnet } from "./custom-chains/mainnet";
import { manta } from "./custom-chains/manta";
import { metis } from "./custom-chains/metis";
import { mode } from "./custom-chains/mode";
import { monad } from "./custom-chains/monad";
import { polygon } from "./custom-chains/polygon";
import { sepolia } from "./custom-chains/sepolia";
import { soneium } from "./custom-chains/soneium";
import { sonic } from "./custom-chains/sonic";
import { story } from "./custom-chains/story";
import { swell } from "./custom-chains/swell";
import { ChainWithIcon } from "./custom-chains/types";
import { world } from "./custom-chains/world";
import { zksyncEra } from "./custom-chains/zksyncEra";

export type { ChainWithIcon };

type ChainImages = {
  [key: string]: string;
};

type Transports = Record<Chain["id"], Transport>;

export const chains: readonly [ChainWithIcon, ...ChainWithIcon[]] = [
  polygon,
  arbitrumOne,
  base,
  avalanche,
  linea,
  celo,
  mode,
  cyber,
  metis,
  forma,
  soneium,
  story,
  ink,
  swell,
  manta,
  zksyncEra,
  sonic,
  world,
  abstract,
  hyperliquid,
  monad,
  kub,
  sepolia,
  baseTestnet,
  mainnet,
];

// Transport creation
const isProduction = process.env.NEXT_PUBLIC_APP_ENVIRONMENT === "production";
const getHeaders = () => (isProduction ? { Referer: "https://confetti.win" } : { Referer: "" });

export const createTransport = (chain: Chain): Transport => {
  const headers = getHeaders();

  if (chain.rpcUrls?.default?.http?.[0] && chain.rpcUrls?.public?.http?.[0]) {
    return fallback([
      http(chain.rpcUrls.default.http[0], { fetchOptions: { headers } }),
      http(chain.rpcUrls.public.http[0], { fetchOptions: { headers } }),
    ]);
  }

  if (chain.rpcUrls?.default?.http?.[0]) {
    return http(chain.rpcUrls.default.http[0], { fetchOptions: { headers } });
  }

  throw new Error(`No valid RPC URLs found for chain ${chain.name}`);
};

export const transports: Transports = chains.reduce<Transports>((acc, chain) => {
  try {
    acc[chain.id] = createTransport(chain);
  } catch (error) {
    console.warn(`Failed to create transport for chain ${chain.name}:`, error);
  }
  return acc;
}, {});

export const chainsImages: ChainImages = chains.reduce((acc: ChainImages, chain) => {
  if (chain.name && chain.iconUrl) {
    acc[chain.name.toLowerCase()] = chain.iconUrl;
  }
  return acc;
}, {});

// Server-safe wagmi config for server components and server-side operations
export const serverConfig = createConfig({
  chains: chains as any,
  transports,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
