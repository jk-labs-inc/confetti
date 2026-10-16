export const xClaimWorkerUrl = (process.env.NEXT_PUBLIC_X_CLAIM_WORKER_URL ?? "").replace(/\/+$/, "");

export const isXClaimConfigured = xClaimWorkerUrl !== "";
