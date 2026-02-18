import { ChainWithIcon } from "./types";

export const megaeth: ChainWithIcon = {
  id: 4326,
  name: "megaeth",
  iconUrl: "/megaeth.jpg",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: [`https://mainnet.megaeth.com/rpc`] },
    default: {
      http: [
        `https://${process.env.NEXT_PUBLIC_QUICKNODE_SLUG}.megaeth-mainnet.quiknode.pro/${process.env.NEXT_PUBLIC_QUICKNODE_KEY}`,
      ],
    },
  },
  blockExplorers: {
    etherscan: { name: "Megaeth Mainnet Scan", url: "https://megaeth.blockscout.org/" },
    default: { name: "Megaeth Mainnet Scan", url: "https://megaeth.blockscout.org/" },
  },
};
