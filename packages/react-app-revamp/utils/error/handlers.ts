import { findChainIdByName } from "@helpers/getChainId";
import { findChainVoteCurrency } from "lib/voteCurrency";
import { ContractFunctionExecutionError, EstimateGasExecutionError } from "viem";
import { ErrorCodes, errorDefinitions, dynamicMessageCodes, numericCodeMap, getErrorMessage } from "./codes";
import { ErrorResult } from "./types";
import { ReactNode } from "react";

const getNumericCode = (error: any): number | undefined => {
  return error.code ?? error.cause?.code ?? error.cause?.cause?.code;
};

const getAdditionalMessage = (code: ErrorCodes | null, error: any): ReactNode | undefined => {
  if (code && errorDefinitions[code]?.additionalMessage) {
    return errorDefinitions[code].additionalMessage;
  }
  return error.shortMessage ?? error.message;
};

const findMatchingError = (error: any): ErrorCodes | null => {
  const numericCode = getNumericCode(error);
  if (numericCode !== undefined && numericCodeMap.has(numericCode)) {
    return numericCodeMap.get(numericCode)!;
  }

  for (const [code, definition] of Object.entries(errorDefinitions)) {
    if (definition.match?.(error)) {
      return code as ErrorCodes;
    }
  }

  return null;
};

const createDynamicMessage = (code: ErrorCodes, chainName?: string): string => {
  if (!dynamicMessageCodes.includes(code) || !chainName) {
    return getErrorMessage(code);
  }

  const voteCurrencySymbol = findChainVoteCurrency(findChainIdByName(chainName))?.symbol;

  if (voteCurrencySymbol) {
    return `please make sure you have enough ${voteCurrencySymbol} on ${chainName}`;
  }

  return getErrorMessage(code);
};

export const handleContractFunctionExecutionError = (error: ContractFunctionExecutionError): ErrorResult => {
  const matchedCode = findMatchingError(error);

  if (matchedCode === ErrorCodes.DUPLICATE_PROPOSAL) {
    return {
      message: getErrorMessage(ErrorCodes.DUPLICATE_PROPOSAL),
      codeFound: true,
      additionalMessage: getAdditionalMessage(ErrorCodes.DUPLICATE_PROPOSAL, error),
      isWarning: true,
    };
  }

  if (matchedCode) {
    return {
      message: getErrorMessage(matchedCode),
      codeFound: true,
      additionalMessage: getAdditionalMessage(matchedCode, error),
    };
  }

  return {
    message: error.message,
    codeFound: false,
    additionalMessage: error.shortMessage ?? error.message,
  };
};

export const handleGenericError = (error: any, chainName?: string): ErrorResult => {
  if (error.codeFound === true && error.code in errorDefinitions) {
    return {
      message: getErrorMessage(error.code as ErrorCodes),
      codeFound: true,
      additionalMessage: error.additionalMessage,
    };
  }

  if (error instanceof EstimateGasExecutionError) {
    return {
      message: createDynamicMessage(ErrorCodes.INSUFFICIENT_FUNDS, chainName),
      codeFound: true,
      additionalMessage: getAdditionalMessage(ErrorCodes.INSUFFICIENT_FUNDS, error),
    };
  }

  if (error instanceof ContractFunctionExecutionError) {
    return handleContractFunctionExecutionError(error);
  }

  const matchedCode = findMatchingError(error);
  if (matchedCode) {
    return {
      message: createDynamicMessage(matchedCode, chainName),
      codeFound: true,
      additionalMessage: getAdditionalMessage(matchedCode, error),
    };
  }

  const code = error.code as ErrorCodes;
  if (code in errorDefinitions || dynamicMessageCodes.includes(code)) {
    return {
      message: createDynamicMessage(code, chainName),
      codeFound: true,
      additionalMessage: getAdditionalMessage(code, error),
    };
  }

  return {
    message: error.message ?? error.reason ?? "An unknown error occurred.",
    codeFound: false,
    additionalMessage: error.shortMessage ?? error.message,
  };
};
