import { chains } from "@config/wagmi";
import { WidgetConfig } from "@lifi/widget";
import { EthereumProvider } from "@lifi/widget-provider-ethereum";
import { resolveBridgeTarget } from "../../utils";

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
 * - Only allows app-supported chains in the "from" chain selector
 * - Only allows the target chain in the "to" chain selector
 * - Only allows the bridge target token for the target chain
 */
const createFilters = (chainId: number, targetTokenAddress: string) => {
  return {
    chains: {
      from: {
        allow: chains.map(chain => chain.id),
      },
      to: {
        allow: [chainId],
      },
    },
    tokens: {
      to: {
        allow: [
          {
            chainId: chainId,
            address: targetTokenAddress,
          },
        ],
      },
    },
  };
};

export const createJumperWidgetConfig = (chainId: number, asset: string, onConnect?: () => void): WidgetConfig => {
  const bridgeTarget = resolveBridgeTarget(chainId, asset);
  const filters = createFilters(chainId, bridgeTarget.tokenAddress);

  return {
    integrator: "Confetti",
    providers: [EthereumProvider()],
    toChain: chainId,
    toToken: bridgeTarget.toToken,
    variant: "compact",
    appearance: "dark",
    sdkConfig: {
      rpcUrls: createRpcUrlsConfig(),
    },
    ...filters,
    theme: {
      container: {
        minWidth: 0,
      },
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
