import { tempo as viemTempo } from "viem/chains";
import { ChainVoteToken, ChainWithIcon } from "./types";

export const OUSD: ChainVoteToken = {
  address: "0x20c0000000000000000000006a37da5c996874be",
  symbol: "OUSD",
  decimals: 6,
  usdPegged: true,
  approveAndVoteGasLimit: 15_000_000,
};

export const TEMPO_WALLET_CURRENCY = { name: "USD", symbol: "USD", decimals: 18 } as const;
export const TEMPO_TRANSACTION_GAS_CAP = 30_000_000n;
export const TEMPO_MULTICALL3 = { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } as const;

export const tempo: ChainWithIcon = {
  ...viemTempo,
  name: "tempo",
  iconUrl: "/tempo.svg",
  nativeCurrency: TEMPO_WALLET_CURRENCY,
  rpcUrls: {
    public: { http: ["https://rpc.tempo.xyz"] },
    default: { http: ["https://rpc.tempo.xyz"] },
  },
  blockExplorers: {
    etherscan: { name: "Tempo Explorer", url: "https://explore.tempo.xyz/" },
    default: { name: "Tempo Explorer", url: "https://explore.tempo.xyz/" },
  },
  contracts: { ...viemTempo.contracts, multicall3: TEMPO_MULTICALL3 },
  voteToken: OUSD,
  transactionGasCap: TEMPO_TRANSACTION_GAS_CAP,
};
