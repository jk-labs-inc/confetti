import { getToken } from "@helpers/getToken";
import { getTokenBalance } from "@helpers/getTokenBalance";
import { addressRegex } from "@helpers/regex";
import { useWallet } from "@hooks/useWallet";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";

export interface FilteredToken {
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  balance?: number;
}

interface PaginationInfo {
  totalLength: number;
  hasMore: boolean;
  pageParam: number;
}

const TOKEN_LIST_API_URL = "/api/token";
const pageSize = 20;

export const TOKENLISTOOOR_SUPPORTED_CHAIN_IDS = [
  1, 10, 100, 1088, 1101, 137, 250, 314, 324, 42161, 42220, 43114, 5, 5000, 534352, 56, 59144, 7777777, 81457, 8453,
];

async function fetchTokenListOrMetadata({
  pageParam = 0,
  chainId,
  tokenIdentifier,
  userAddress,
}: {
  pageParam?: number;
  chainId: number;
  tokenIdentifier: string;
  userAddress?: string;
}): Promise<{ tokens: FilteredToken[]; pagination: PaginationInfo }> {
  if (!TOKENLISTOOOR_SUPPORTED_CHAIN_IDS.includes(chainId)) {
    return fetchTokenByAddress({ chainId, tokenIdentifier, userAddress });
  }

  const response = await fetch(
    `${TOKEN_LIST_API_URL}?chainId=${chainId}&tokenIdentifier=${encodeURIComponent(
      tokenIdentifier,
    )}&page=${pageParam}&limit=${pageSize}`,
  );

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.tokens && data.tokens.length > 0) {
    const tokens = data.tokens.map((token: any) => ({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoURI:
        token.logoURI === "" || token.logoURI === "missing_thumb.png" ? "/confetti/loader/frame-1.svg" : token.logoURI,
    }));

    if (userAddress) {
      const tokensWithBalances = await Promise.all(
        tokens.map(async (token: { address: string; decimals: number }) => {
          try {
            const balance = await getTokenBalance({
              tokenAddress: token.address as `0x${string}`,
              userAddress: userAddress as `0x${string}`,
              chainId,
            });

            return {
              ...token,
              balance: Number(formatUnits(balance.value, token.decimals)),
            };
          } catch (error) {
            console.error(`error fetching balance for token ${token.address}:`, error);
            return token;
          }
        }),
      );

      return {
        tokens: tokensWithBalances,
        pagination: {
          totalLength: data.pagination.totalLength,
          hasMore: data.pagination.hasMore,
          pageParam: pageParam,
        },
      };
    }

    return {
      tokens,
      pagination: {
        totalLength: data.pagination.totalLength,
        hasMore: data.pagination.hasMore,
        pageParam: pageParam,
      },
    };
  }

  return fetchTokenByAddress({ chainId, tokenIdentifier, userAddress });
}

async function fetchTokenByAddress({
  chainId,
  tokenIdentifier,
  userAddress,
}: {
  chainId: number;
  tokenIdentifier: string;
  userAddress?: string;
}): Promise<{ tokens: FilteredToken[]; pagination: PaginationInfo }> {
  if (addressRegex.test(tokenIdentifier)) {
    const token = await getToken({
      address: tokenIdentifier as `0x${string}`,
      chainId,
    });

    const tokenData: FilteredToken = {
      address: tokenIdentifier,
      name: token.name ?? "",
      symbol: token.symbol ?? "",
      logoURI: "/confetti/loader/frame-1.svg",
      decimals: token.decimals ?? 18,
    };

    if (tokenData.name === "" || tokenData.symbol === "") {
      return {
        tokens: [],
        pagination: { totalLength: 0, hasMore: false, pageParam: 0 },
      };
    }

    if (userAddress) {
      try {
        const balance = await getTokenBalance({
          tokenAddress: tokenData.address as `0x${string}`,
          userAddress: userAddress as `0x${string}`,
          chainId,
        });

        tokenData.balance = Number(formatUnits(balance.value, tokenData.decimals));
      } catch (error) {
        console.error(`error fetching balance for token ${tokenData.address}:`, error);
      }
    }

    return {
      tokens: [tokenData],
      pagination: {
        totalLength: 1,
        hasMore: false,
        pageParam: 0,
      },
    };
  }

  return { tokens: [], pagination: { totalLength: 0, hasMore: false, pageParam: 0 } };
}

export function useTokenList(chainId: number, tokenIdentifier: string) {
  const { userAddress } = useWallet();

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["searchTokens", chainId, tokenIdentifier, userAddress],
    queryFn: ({ pageParam = 0 }) =>
      fetchTokenListOrMetadata({
        pageParam,
        chainId,
        tokenIdentifier,
        userAddress,
      }),
    getNextPageParam: lastPage => {
      return lastPage.pagination.hasMore ? (lastPage.pagination.pageParam ?? 0) + 1 : undefined;
    },
    initialPageParam: 0,
  });

  const tokens = data?.pages.flatMap(page => page.tokens) || [];

  return {
    loading: isLoading,
    error: isError ? error : null,
    tokens,
    fetchTokenListPerPage: fetchNextPage,
    hasMore: hasNextPage,
  };
}
