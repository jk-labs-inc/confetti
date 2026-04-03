export type TokenConfig = {
  name: string;
  symbol: string;
  address: string | null;
};

export type ChainConfig = {
  name: string;
  id: number;
  tokens: TokenConfig[];
};

type ChainConfigs = {
  [key: string]: ChainConfig;
};

const CHAIN_CONFIGS: ChainConfigs = {
  ethereum: {
    name: "Ethereum",
    id: 1,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    ],
  },
  polygon: {
    name: "Polygon",
    id: 137,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      },
    ],
  },
  arbitrum: {
    name: "Arbitrum",
    id: 42161,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      },
    ],
  },
  optimism: {
    name: "Optimism",
    id: 10,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      },
    ],
  },
  avalanche: {
    name: "Avalanche",
    id: 43114,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      },
    ],
  },
  mumbai: {
    name: "Mumbai",
    id: 80001,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
      },
    ],
  },
  sepolia: {
    name: "Sepolia",
    id: 11155111,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f",
      },
    ],
  },
  baseTestNet: {
    name: "Base Testnet",
    id: 84531,
    tokens: [
      {
        name: "USDC",
        symbol: "usdc",
        address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
      },
    ],
  },
};

export default CHAIN_CONFIGS;
