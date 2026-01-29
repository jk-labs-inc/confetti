"use client";

import { chains, transports } from "@config/wagmi";
import ParaWeb, { Environment, TExternalWallet } from "@getpara/react-sdk-lite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { ParaProvider } from "@getpara/react-sdk-lite";

type ProvidersProps = {
  children: ReactNode;
};

const PARA_API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY as string;
const PARA_ENVIRONMENT =
  process.env.NEXT_PUBLIC_APP_ENVIRONMENT === "development" ? Environment.BETA : Environment.PRODUCTION;

const para = new ParaWeb(PARA_ENVIRONMENT, PARA_API_KEY);

const queryClient = new QueryClient();

const EXTERNAL_WALLETS: TExternalWallet[] = [
  "METAMASK",
  "WALLETCONNECT",
  "COINBASE",
  "RAINBOW",
  "PHANTOM",
  "OKX",
  "RABBY",
  "ZERION",
  "SAFE",
];

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={para}
        config={{
          appName: "Confetti",
        }}
        paraModalConfig={{
          theme: {
            darkForegroundColor: "#e5e5e5",
            darkBackgroundColor: "#1A1F2B",
            mode: "dark",
            borderRadius: "lg",
            font: "Lato",
          },
          logo: "/confetti/loader/frame-1.svg",
          oAuthMethods: ["GOOGLE", "TWITTER", "DISCORD", "TELEGRAM"],
        }}
        externalWalletConfig={{
          wallets: EXTERNAL_WALLETS,
          evmConnector: {
            config: {
              chains: chains,
              transports: transports,
            },
          },
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
          },
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
};

export default Providers;
