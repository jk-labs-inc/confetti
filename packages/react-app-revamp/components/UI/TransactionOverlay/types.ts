import { SuccessToastConfig } from "@components/UI/Toast/types";

export enum TransactionOverlayFlow {
  ENTRY = "entry",
  VOTE = "vote",
  REWARDS = "rewards",
}

export enum TransactionOverlayPhase {
  SIGNING = "signing",
  MINING = "mining",
  INDEXING = "indexing",
  SUCCESS = "success",
  ERROR = "error",
}

export type TransactionOverlayPendingPhase =
  | TransactionOverlayPhase.SIGNING
  | TransactionOverlayPhase.MINING
  | TransactionOverlayPhase.INDEXING;

export type TransactionOverlayStepStatus = "pending" | "active" | "completed";

export interface TransactionOverlayStep {
  label: string;
  status: TransactionOverlayStepStatus;
}

export type TransactionOverlaySuccessMeta = Pick<SuccessToastConfig, "id" | "dataAttributes">;
