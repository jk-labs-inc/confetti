import { chains, ChainWithIcon } from "@config/wagmi";
import { FilteredToken } from "@hooks/useTokenList";
import { isVoteTokenOfPot, voteTokenListItem } from "lib/rewards/pot";
import { chainHasNativeCoin, findChainVoteCurrency } from "lib/voteCurrency";
import { v4 as uuidV4 } from "uuid";
import { FundPoolToken } from "./store";

type ChainNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};

const NATIVE_FUND_TOKEN_ADDRESS = "native";
const FALLBACK_TOKEN_LOGO = "/confetti/loader/frame-1.svg";
const EMPTY_FUND_AMOUNT = "0";

export const generateNativeToken = (nativeCurrency?: ChainNativeCurrency, chainNativeCurrencySymbol?: string) => {
  return {
    address: NATIVE_FUND_TOKEN_ADDRESS,
    name: nativeCurrency?.name ?? "",
    symbol: chainNativeCurrencySymbol ?? "",
    logoURI: chainNativeCurrencySymbol === "ETH" ? "/tokens/ether.svg" : FALLBACK_TOKEN_LOGO,
    decimals: nativeCurrency?.decimals ?? 18,
  };
};

const generateDefaultFundToken = (chain: ChainWithIcon | undefined): FilteredToken => {
  const voteCurrency = findChainVoteCurrency(chain?.id);

  return voteCurrency?.kind === "token"
    ? voteTokenListItem(voteCurrency, chain?.iconUrl)
    : generateNativeToken(chain?.nativeCurrency, chain?.nativeCurrency?.symbol);
};

const isNativeFundToken = (token: Pick<FilteredToken, "address">): boolean =>
  token.address === NATIVE_FUND_TOKEN_ADDRESS;

export const createDefaultFundWidget = (chain: ChainWithIcon | undefined): FundPoolToken => ({
  ...generateDefaultFundToken(chain),
  amount: EMPTY_FUND_AMOUNT,
  id: uuidV4(),
});

const voteTokenAddresses = new Set(
  chains.flatMap(chain => (chain.voteToken ? [chain.voteToken.address.toLowerCase()] : [])),
);

const isVoteTokenOfAnotherChain = (chain: ChainWithIcon | undefined, token: Pick<FilteredToken, "address">): boolean =>
  voteTokenAddresses.has(token.address.toLowerCase()) && !isVoteTokenOfPot(chain?.id, token.address);

const isFundableOnChain = (chain: ChainWithIcon | undefined, token: Pick<FilteredToken, "address">): boolean =>
  isNativeFundToken(token) ? chainHasNativeCoin(chain?.id) : !isVoteTokenOfAnotherChain(chain, token);

export const withFundableTokens = (
  chain: ChainWithIcon | undefined,
  tokenWidgets: FundPoolToken[],
): FundPoolToken[] => {
  const fundableWidgets = tokenWidgets.filter(widget => isFundableOnChain(chain, widget));
  if (fundableWidgets.length === 0) return [createDefaultFundWidget(chain)];

  return fundableWidgets.length === tokenWidgets.length ? tokenWidgets : fundableWidgets;
};
