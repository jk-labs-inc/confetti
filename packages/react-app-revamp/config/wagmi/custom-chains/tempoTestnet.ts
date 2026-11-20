import { tempoModerato } from "viem/chains";
import { OUSD, TEMPO_MULTICALL3, TEMPO_TRANSACTION_GAS_CAP, TEMPO_WALLET_CURRENCY } from "./tempo";
import { ChainWithIcon } from "./types";

export const tempoTestnet: ChainWithIcon = {
  ...tempoModerato,
  name: "tempoTestnet",
  iconUrl: "/tempo.svg",
  nativeCurrency: TEMPO_WALLET_CURRENCY,
  rpcUrls: {
    public: { http: ["https://rpc.moderato.tempo.xyz"] },
    default: { http: ["https://rpc.moderato.tempo.xyz"] },
  },
  blockExplorers: {
    etherscan: { name: "Tempo Testnet Explorer", url: "https://explore.testnet.tempo.xyz/" },
    default: { name: "Tempo Testnet Explorer", url: "https://explore.testnet.tempo.xyz/" },
  },
  contracts: { ...tempoModerato.contracts, multicall3: TEMPO_MULTICALL3 },
  voteToken: OUSD,
  transactionGasCap: TEMPO_TRANSACTION_GAS_CAP,
  testnet: true,
};
