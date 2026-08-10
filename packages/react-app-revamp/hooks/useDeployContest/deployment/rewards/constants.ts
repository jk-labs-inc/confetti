import { polygon } from "viem/chains";

export const WALLET_RPC_SYNC_CHAIN_IDS = new Set<number>([polygon.id]);
export const WALLET_RPC_SYNC_DELAY_MS = 4000;

export const MAX_ATTACH_ATTEMPTS = 5;
export const ATTACH_RETRY_DELAY_MS = 3000;

export const MAX_DEPLOY_ATTEMPTS = 5;
export const DEPLOY_RETRY_DELAY_MS = 3000;
