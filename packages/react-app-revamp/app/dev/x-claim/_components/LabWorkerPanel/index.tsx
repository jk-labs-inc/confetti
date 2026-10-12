"use client";

import { xClaimWorkerUrl } from "@config/xClaim";
import { useIssueJwt } from "@getpara/react-sdk-lite";
import { useWallet } from "@hooks/useWallet";
import { useXClaim } from "@hooks/useXClaim";
import { useWalletProof } from "@hooks/useXClaim/useWalletProof";
import {
  fetchClaimMe,
  fetchSpots,
  requestNonce,
  startXLogin,
  submitClaim,
  toXClaimFailure,
  XClaimError,
} from "lib/xClaim/client";
import { decodeJwt, type WalletProofHeader } from "lib/xClaim/proof";
import { useState } from "react";
import { LAB_PATH } from "../../constants";
import LabButton from "../LabButton";
import LabJson from "../LabJson";

type LabOutput = { label: string; status: "running" | "done" | "failed"; value: unknown };

const authorizeUrlOf = (value: unknown) =>
  typeof value === "object" && value !== null && "authorizeUrl" in value && typeof value.authorizeUrl === "string"
    ? value.authorizeUrl
    : null;

const LabWorkerPanel = () => {
  const { connector } = useWallet();
  const { runWithProof } = useWalletProof(connector);
  const { issueJwtAsync } = useIssueJwt();
  const wallet = useXClaim().sheet.view.wallet;
  const [output, setOutput] = useState<LabOutput | null>(null);

  const run = async (label: string, task: () => Promise<unknown>) => {
    setOutput({ label, status: "running", value: null });
    try {
      setOutput({ label, status: "done", value: await task() });
    } catch (error) {
      setOutput({ label, status: "failed", value: toXClaimFailure(error) });
    }
  };

  const withProof = <T,>(call: (proof: WalletProofHeader) => Promise<T>) =>
    wallet.kind === "signed_out"
      ? Promise.reject(new XClaimError({ reason: "signed_out", detail: "sign in first" }))
      : runWithProof({ wallet, call });

  const proofNote = wallet.kind === "external" ? " (asks for a signature)" : "";
  const authorizeUrl = output?.status === "done" ? authorizeUrlOf(output.value) : null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-neutral-11">worker</h2>
      <LabJson title="config and wallet" value={{ workerUrl: xClaimWorkerUrl || null, wallet }} />
      <div className="flex flex-col gap-2">
        <LabButton onClick={() => run("GET /spots", fetchSpots)}>GET /spots</LabButton>
        <LabButton onClick={() => run("POST /nonce", requestNonce)}>POST /nonce</LabButton>
        <LabButton
          onClick={() =>
            run("POST /x/start", () => withProof(proof => startXLogin({ proof, returnPath: LAB_PATH })))
          }
        >
          POST /x/start{proofNote}
        </LabButton>
        <LabButton onClick={() => run("GET /claim/me", () => withProof(fetchClaimMe))}>
          GET /claim/me{proofNote}
        </LabButton>
        <LabButton onClick={() => run("POST /claim", () => withProof(submitClaim))}>POST /claim{proofNote}</LabButton>
        {wallet.kind === "embedded" && (
          <LabButton
            onClick={() =>
              run("para token claims", async () => {
                const { token, keyId } = await issueJwtAsync();
                return { keyId, ...decodeJwt(token) };
              })
            }
          >
            decode para token (payload.aud goes in PARA_JWT_AUDIENCE)
          </LabButton>
        )}
      </div>
      {authorizeUrl && (
        <a className="text-secondary-11 underline" href={authorizeUrl}>
          continue to x with this login
        </a>
      )}
      {output && <LabJson title={`${output.label} · ${output.status}`} value={output.value} />}
    </div>
  );
};

export default LabWorkerPanel;
