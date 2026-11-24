import { isInsufficientTokenBalanceRevert } from "./tokenReverts";
import { ErrorDefinition } from "./types";

export enum ErrorCodes {
  CALL_EXCEPTION = "CALL_EXCEPTION",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  MISSING_NEW = "MISSING_NEW",
  NONCE_EXPIRED = "NONCE_EXPIRED",
  NUMERIC_FAULT = "NUMERIC_FAULT",
  REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED",
  TRANSACTION_REPLACED = "TRANSACTION_REPLACED",
  UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT",
  EXECUTION_REVERTED = "EXECUTION_REVERTED",
  DUPLICATE_PROPOSAL = "DUPLICATE_PROPOSAL",
  PRICE_CHANGED = "PRICE_CHANGED",
  UNAUTHORIZED_RPC = "UNAUTHORIZED_RPC",
}

export const errorDefinitions: Record<ErrorCodes, ErrorDefinition> = {
  [ErrorCodes.CALL_EXCEPTION]: {
    code: ErrorCodes.CALL_EXCEPTION,
    message: "A contract call failed. Check the contract's conditions or requirements.",
  },
  [ErrorCodes.INSUFFICIENT_FUNDS]: {
    code: ErrorCodes.INSUFFICIENT_FUNDS,
    numericCode: -32000,
    message: "Insufficient funds for transaction.",
    match: error =>
      error.message?.includes("insufficient funds for gas * price + value") ||
      error.code === -32603 ||
      error.data?.code === -32000 ||
      isInsufficientTokenBalanceRevert(error),
  },
  [ErrorCodes.MISSING_NEW]: {
    code: ErrorCodes.MISSING_NEW,
    message: "The 'new' keyword is missing in contract deployment.",
  },
  [ErrorCodes.NONCE_EXPIRED]: {
    code: ErrorCodes.NONCE_EXPIRED,
    message: "This nonce has been used before. Please try with a fresh nonce.",
  },
  [ErrorCodes.NUMERIC_FAULT]: {
    code: ErrorCodes.NUMERIC_FAULT,
    message: "A numeric operation resulted in an overflow or underflow.",
  },
  [ErrorCodes.REPLACEMENT_UNDERPRICED]: {
    code: ErrorCodes.REPLACEMENT_UNDERPRICED,
    message: "The new transaction's gas price is too low to replace the old one. Consider increasing it.",
  },
  [ErrorCodes.TRANSACTION_REPLACED]: {
    code: ErrorCodes.TRANSACTION_REPLACED,
    message: "This transaction was replaced by another with the same nonce, maybe due to a higher gas price.",
  },
  [ErrorCodes.UNPREDICTABLE_GAS_LIMIT]: {
    code: ErrorCodes.UNPREDICTABLE_GAS_LIMIT,
    message: "Gas estimation failed. Consider setting a gas limit manually, or ensure the transaction is valid.",
  },
  [ErrorCodes.EXECUTION_REVERTED]: {
    code: ErrorCodes.EXECUTION_REVERTED,
    message: "Transaction execution reverted.",
    match: error => error.message?.includes("execution reverted") || error.message?.includes("out of gas"),
  },
  [ErrorCodes.DUPLICATE_PROPOSAL]: {
    code: ErrorCodes.DUPLICATE_PROPOSAL,
    message: "Entry already entered!",
    additionalMessage: "This looks like a duplicate submission.",
    match: error => error.message?.includes("DuplicateSubmission"),
  },
  [ErrorCodes.PRICE_CHANGED]: {
    code: ErrorCodes.PRICE_CHANGED,
    message: "Ahh, looks like the price has gone up.",
  },
  [ErrorCodes.UNAUTHORIZED_RPC]: {
    code: ErrorCodes.UNAUTHORIZED_RPC,
    numericCode: -32006,
    message: "Your wallet's RPC may be blocking this request",
    additionalMessage: (
      <>
        Try updating your RPC URL in wallet to a public one from{" "}
        <a href="https://chainlist.org/" target="_blank" rel="noopener noreferrer" className="underline">
          Chainlist
        </a>
      </>
    ),
    match: error => error.message?.includes("Unauthorized"),
  },
};

export const dynamicMessageCodes: readonly ErrorCodes[] = [
  ErrorCodes.EXECUTION_REVERTED,
  ErrorCodes.INSUFFICIENT_FUNDS,
];

export const numericCodeMap: Map<number, ErrorCodes> = new Map(
  Object.values(errorDefinitions)
    .filter(def => def.numericCode !== undefined)
    .map(def => [def.numericCode!, def.code as ErrorCodes]),
);

export const getErrorMessage = (code: ErrorCodes): string => {
  return errorDefinitions[code]?.message ?? "An unknown error occurred.";
};
