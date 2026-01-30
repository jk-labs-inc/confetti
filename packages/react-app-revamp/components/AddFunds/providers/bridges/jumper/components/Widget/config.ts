import { chains } from "@config/wagmi";
import { WidgetConfig } from "@lifi/widget";

const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Extracts RPC URLs from wagmi chains config and formats them for Jumper widget
 */
const createRpcUrlsConfig = () => {
  return chains.reduce(
    (acc, chain) => {
      const rpcUrls: string[] = [];

      if (chain.rpcUrls?.default?.http) {
        rpcUrls.push(...chain.rpcUrls.default.http);
      }

      if (rpcUrls.length > 0) {
        acc[chain.id] = rpcUrls;
      }

      return acc;
    },
    {} as Record<number, string[]>,
  );
};

/**
 * Creates filters for chains and tokens based on the target chain
 * - Only allows the target chain in the "to" chain selector
 * - Only allows native tokens for the target chain
 */
const createFilters = (chainId: number) => {
  return {
    chains: {
      to: {
        allow: [chainId],
      },
    },
    tokens: {
      to: {
        allow: [
          {
            chainId: chainId,
            address: NATIVE_TOKEN_ADDRESS,
          },
        ],
      },
    },
  };
};

export const createJumperWidgetConfig = (chainId: number, asset: string, onConnect?: () => void): WidgetConfig => {
  const filters = createFilters(chainId);

  return {
    integrator: "Confetti",
    toChain: chainId,
    toToken: asset,
    variant: "compact",
    appearance: "dark",
    sdkConfig: {
      rpcUrls: createRpcUrlsConfig(),
    },
    ...filters,
    theme: {
      colorSchemes: {
        dark: {
          palette: {
            primary: {
              main: "#bb65ff",
            },
            background: {
              default: "#000000",
              paper: "#000000",
            },
            success: {
              main: "#78ffc6",
            },
            error: {
              main: "#ff78a9",
            },
            text: {
              primary: "#e5e5e5",
              secondary: "#9d9d9d",
            },
          },
        },
      },
      typography: {
        fontFamily: "Lato",
      },
    },
    walletConfig: {
      onConnect() {
        onConnect?.();
      },
    },
  };
};
