const X_CLAIM_WORKER_URL = (process.env.NEXT_PUBLIC_X_CLAIM_WORKER_URL ?? "").replace(/\/+$/, "");

export const xClaimWorkerUrl = X_CLAIM_WORKER_URL;

export const isXClaimConfigured = X_CLAIM_WORKER_URL !== "";
