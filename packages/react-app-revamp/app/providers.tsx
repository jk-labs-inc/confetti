"use client";

import ParaSignInModeReset from "@components/ParaSignInModeReset";
import { chains, transports } from "@config/wagmi";
import { funkitConfig, funkitTheme, isFunkitConfigured } from "@config/funkit";
import { FunkitProvider } from "@funkit/connect";
import ParaWeb, { AuthLayout, Environment, TExternalWallet } from "@getpara/react-sdk-lite";
import { useParaSignInStore } from "@hooks/useParaSignIn/store";
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

const DEFAULT_AUTH_LAYOUT = [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL];
const EMBEDDED_ONLY_AUTH_LAYOUT = [AuthLayout.AUTH_FULL];

const Providers: FC<ProvidersProps> = ({ children }) => {
  const isEmbeddedOnly = useParaSignInStore(state => state.isEmbeddedOnly);

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={para}
        config={{
          appName: "Confetti",
        }}
        paraModalConfig={{
          theme: {
            foregroundColor: "#e5e5e5",
            backgroundColor: "#1A1F2B",
            mode: "dark",
            borderRadius: "lg",
            font: "Lato",
          },
          logo: "/confetti-logo-high-res.png",
          oAuthMethods: ["GOOGLE", "TWITTER", "DISCORD", "TELEGRAM"],
          authLayout: isEmbeddedOnly ? EMBEDDED_ONLY_AUTH_LAYOUT : DEFAULT_AUTH_LAYOUT,
        }}
        configOverrides={{
          modalConfig: {
            disableAddFundsPrompt: true,
          },
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
        <ParaSignInModeReset />
        {isFunkitConfigured ? (
          <FunkitProvider funkitConfig={funkitConfig} theme={funkitTheme} modalSize="medium" locale="en">
            {children}
          </FunkitProvider>
        ) : (
          children
        )}
      </ParaProvider>
    </QueryClientProvider>
  );
};

export default Providers;
