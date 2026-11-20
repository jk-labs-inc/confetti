const TIP20_INSUFFICIENT_ALLOWANCE_MARKERS = ["0x13be252b", "tip20 token error: insufficientallowance"];
const TIP20_INSUFFICIENT_BALANCE_MARKERS = ["0x832f98b5", "tip20 token error: insufficientbalance"];
const CAUSE_CHAIN_DEPTH_LIMIT = 12;

const describeLink = (link: any): string[] => {
  const nestedRpcError = typeof link.data === "object" && link.data !== null ? link.data : {};

  return [
    link.data,
    link.raw,
    link.signature,
    link.details,
    link.shortMessage,
    link.message,
    nestedRpcError.data,
    nestedRpcError.message,
  ].filter((text): text is string => typeof text === "string");
};

const revertMentions = (error: unknown, markers: string[]): boolean => {
  let link: any = error;

  for (let depth = 0; link && typeof link === "object" && depth < CAUSE_CHAIN_DEPTH_LIMIT; depth++) {
    const texts = describeLink(link).map(text => text.toLowerCase());

    if (texts.some(text => markers.some(marker => text.includes(marker)))) return true;

    link = link.cause;
  }

  return false;
};

export const isInsufficientAllowanceRevert = (error: unknown): boolean =>
  revertMentions(error, TIP20_INSUFFICIENT_ALLOWANCE_MARKERS);

export const isInsufficientTokenBalanceRevert = (error: unknown): boolean =>
  revertMentions(error, TIP20_INSUFFICIENT_BALANCE_MARKERS);
