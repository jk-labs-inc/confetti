import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useIssueJwt } from "@getpara/react-sdk-lite";
import { signMessage } from "@wagmi/core";
import { requestNonce, XClaimError } from "lib/xClaim/client";
import { buildSiweMessage, encodeWalletProof, paraTokenCache, type WalletProofHeader } from "lib/xClaim/proof";
import type { XClaimEmbeddedWallet, XClaimSignedInWallet } from "lib/xClaim/types";
import { useCallback } from "react";
import { didUserReject } from "utils/error";
import type { Connector } from "wagmi";

interface ProofRequest<TWallet, T> {
  wallet: TWallet;
  call: (proof: WalletProofHeader) => Promise<T>;
  onProven?: () => void;
}

export type WithParaProof = <T>(request: ProofRequest<XClaimEmbeddedWallet, T>) => Promise<T>;
export type RunWithProof = <T>(request: ProofRequest<XClaimSignedInWallet, T>) => Promise<T>;

export interface WalletProof {
  withParaProof: WithParaProof;
  runWithProof: RunWithProof;
}

const isWalletProofError = (error: unknown) => error instanceof XClaimError && error.failure.reason === "wallet_proof";

const errorText = (error: unknown) => (error instanceof Error ? error.message : "");

export const useWalletProof = (connector: Connector | undefined): WalletProof => {
  const { issueJwtAsync } = useIssueJwt();

  const issueParaToken = useCallback(
    async (wallet: XClaimEmbeddedWallet) => {
      try {
        const { token } = await issueJwtAsync();
        paraTokenCache.write({ address: wallet.address, jwt: token, now: Date.now() });
        return token;
      } catch (error) {
        throw new XClaimError({ reason: "wallet_proof", detail: `para_jwt_unavailable ${errorText(error)}`.trim() });
      }
    },
    [issueJwtAsync],
  );

  const withParaProof: WithParaProof = useCallback(
    async ({ wallet, call, onProven }) => {
      const cached = paraTokenCache.read({ address: wallet.address, now: Date.now() });
      const jwt = cached ?? (await issueParaToken(wallet));
      onProven?.();
      try {
        return await call(encodeWalletProof({ kind: "para", jwt, address: wallet.address }));
      } catch (error) {
        if (!cached || !isWalletProofError(error)) throw error;
        paraTokenCache.clear();
        const freshJwt = await issueParaToken(wallet);
        return call(encodeWalletProof({ kind: "para", jwt: freshJwt, address: wallet.address }));
      }
    },
    [issueParaToken],
  );

  const runWithProof: RunWithProof = useCallback(
    async ({ wallet, call, onProven }) => {
      if (wallet.kind === "embedded") return withParaProof({ wallet, call, onProven });

      const nonce = await requestNonce();
      const message = buildSiweMessage({
        address: wallet.address,
        nonce,
        issuedAt: new Date(),
        host: window.location.host,
        origin: window.location.origin,
      });

      let signature: `0x${string}`;
      try {
        signature = await signMessage(getWagmiConfig(), { message, account: wallet.address, connector });
      } catch (error) {
        if (didUserReject(error)) throw new XClaimError({ reason: "signature_rejected", detail: "user rejected" });
        throw new XClaimError({ reason: "wallet_proof", detail: `sign_failed ${errorText(error)}`.trim() });
      }

      onProven?.();
      return call(encodeWalletProof({ kind: "siwe", message, signature }));
    },
    [connector, withParaProof],
  );

  return { withParaProof, runWithProof };
};
