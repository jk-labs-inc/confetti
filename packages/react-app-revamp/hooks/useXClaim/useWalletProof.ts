import { executeWithTimeout, TimeoutError } from "@helpers/timeout";
import { useIssueJwt } from "@getpara/react-sdk-lite";
import { XClaimError } from "lib/xClaim/client";
import { PARA_JWT_TIMEOUT_MS } from "lib/xClaim/constants";
import { encodeWalletProof, paraTokenCache, type WalletProofHeader } from "lib/xClaim/proof";
import type { XClaimEmbeddedWallet } from "lib/xClaim/types";
import { useCallback } from "react";

interface ProofRequest<T> {
  wallet: XClaimEmbeddedWallet;
  call: (proof: WalletProofHeader) => Promise<T>;
}

export type WithParaProof = <T>(request: ProofRequest<T>) => Promise<T>;

const isWalletProofError = (error: unknown) => error instanceof XClaimError && error.failure.reason === "wallet_proof";

const errorText = (error: unknown) => (error instanceof Error ? error.message : "");

export const useWalletProof = (): { withParaProof: WithParaProof } => {
  const { issueJwtAsync } = useIssueJwt();

  const issueParaToken = useCallback(
    async (wallet: XClaimEmbeddedWallet) => {
      const issuing = issueJwtAsync().then(({ token }) => {
        paraTokenCache.write({ address: wallet.address, jwt: token, now: Date.now() });
        return token;
      });
      try {
        return await executeWithTimeout(PARA_JWT_TIMEOUT_MS, issuing);
      } catch (error) {
        if (error instanceof TimeoutError) throw new XClaimError({ reason: "temporary", detail: "para_jwt_timeout" });
        throw new XClaimError({ reason: "wallet_proof", detail: `para_jwt_unavailable ${errorText(error)}`.trim() });
      }
    },
    [issueJwtAsync],
  );

  const withParaProof: WithParaProof = useCallback(
    async ({ wallet, call }) => {
      const cached = paraTokenCache.read({ address: wallet.address, now: Date.now() });
      const jwt = cached ?? (await issueParaToken(wallet));
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

  return { withParaProof };
};
