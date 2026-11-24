import { getChainFromId } from "@helpers/getChainFromId";
import getVoterRewardsModuleContractVersion from "@helpers/getVoterRewardsModuleContractVersion";
import { verifyContractBytecode } from "@helpers/verifyContractBytecode";
import { safeCompareVersions } from "@helpers/versions";
import { Config, getBalance, readContract, readContracts } from "@wagmi/core";
import type { ContestContract } from "lib/contests/types";
import { Abi, Address, erc20Abi, formatUnits, zeroAddress } from "viem";
import {
  ContestPoolRead,
  ContractQuery,
  ModuleType,
  RewardsModuleVerification,
  RewardsTotalsRead,
  RewardTokensLookup,
  TokenData,
  TotalRewardsQuery,
  VOTER_REWARDS_VERSION,
} from "../types";

interface ReleasedAndTokenTotals {
  nativeTotalReleased: bigint;
  tokens: Record<string, TokenData>;
  isComplete: boolean;
}

const NO_RELEASED_OR_TOKEN_TOTALS: ReleasedAndTokenTotals = { nativeTotalReleased: 0n, tokens: {}, isComplete: false };
const TOKEN_CALLS_PER_ADDRESS = 4;

export function findRewardTokensChainName(chainId: number): string | undefined {
  return getChainFromId(chainId)?.name.toLowerCase();
}

export async function readOfficialRewardsModule(config: Config, contest: ContestContract): Promise<Address | null> {
  const hasRewardsModule = contest.abi.some(item => item.type === "function" && item.name === "officialRewardsModule");
  if (!hasRewardsModule) return null;

  const address = (await readContract(config, {
    ...contest,
    functionName: "officialRewardsModule",
    args: [],
  })) as Address;

  return address === zeroAddress ? null : address;
}

export async function readModuleType(config: Config, address: string, abi: Abi, chainId: number): Promise<string> {
  try {
    return (await readContract(config, {
      address: address as `0x${string}`,
      abi,
      functionName: "MODULE_TYPE",
      chainId,
      args: [],
    })) as string;
  } catch (error) {
    console.error("Error getting module type:", error);
    return "UNKNOWN";
  }
}

export async function verifyRewardsModule(
  config: Config,
  rewardsModuleAddress: string,
  chainId: number,
): Promise<RewardsModuleVerification> {
  try {
    const { abi, version, deployedBytecode } = await getVoterRewardsModuleContractVersion(
      rewardsModuleAddress,
      chainId,
    );

    if (!abi || !deployedBytecode) return { status: "unreadable" };

    const versionOrder = safeCompareVersions(version, VOTER_REWARDS_VERSION);
    const hasModuleTypeGetter = versionOrder !== null && versionOrder >= 0;

    const [isBytecodeValid, moduleType] = await Promise.all([
      verifyContractBytecode(rewardsModuleAddress, chainId, deployedBytecode),
      hasModuleTypeGetter
        ? readModuleType(config, rewardsModuleAddress, abi as Abi, chainId)
        : ModuleType.AUTHOR_REWARDS,
    ]);

    if (!isBytecodeValid) return { status: "bytecode-invalid" };

    if (versionOrder === null) {
      console.error(`Error in verifyRewardsModule: unreadable rewards module version "${version}"`);
      return { status: "unreadable" };
    }

    return { status: "verified", abi: abi as Abi, moduleType: moduleType as ModuleType, version };
  } catch (error) {
    console.error("Error in verifyRewardsModule:", error);
    return { status: "unreadable" };
  }
}

async function readReleasedAndTokenTotals(
  config: Config,
  { rewardsModuleAddress, rewardsModuleAbi, chainId }: TotalRewardsQuery,
  tokenAddressesLookup: Promise<Address[]>,
): Promise<ReleasedAndTokenTotals> {
  try {
    const tokenAddresses = await tokenAddressesLookup;

    const contractCalls: ContractQuery[] = [
      {
        address: rewardsModuleAddress,
        abi: rewardsModuleAbi,
        functionName: "totalReleased",
        chainId,
        args: [],
      },
      ...tokenAddresses.flatMap((tokenAddress): ContractQuery[] => [
        {
          address: rewardsModuleAddress,
          abi: rewardsModuleAbi,
          functionName: "erc20TotalReleased",
          chainId,
          args: [tokenAddress],
        },
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
          chainId,
          args: [],
        },
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
          chainId,
          args: [],
        },
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          chainId,
          args: [rewardsModuleAddress],
        },
      ]),
    ];

    const contractResults = await readContracts(config, { contracts: contractCalls });

    const nativeTotalReleased = (contractResults[0].result as bigint) || 0n;
    const tokens: Record<string, TokenData> = {};

    tokenAddresses.forEach((tokenAddress, index) => {
      const resultBaseIndex = 1 + index * TOKEN_CALLS_PER_ADDRESS;
      const tokenResults = contractResults.slice(resultBaseIndex, resultBaseIndex + TOKEN_CALLS_PER_ADDRESS);
      const [tokenTotalReleasedResult, symbolResult, decimalsResult, balanceResult] = tokenResults;

      const failedResult = tokenResults.find(result => result.status === "failure");
      if (failedResult) {
        console.error(`Failed to get token data for ${tokenAddress}:`, failedResult.error);
        return;
      }

      const tokenTotalReleased = (tokenTotalReleasedResult.result as bigint) || 0n;
      const decimals = decimalsResult.result as number;
      const tokenTotal = ((balanceResult.result as bigint) || 0n) + tokenTotalReleased;

      tokens[tokenAddress] = {
        value: tokenTotal,
        formatted: formatUnits(tokenTotal, decimals),
        symbol: symbolResult.result as string,
        decimals,
      };
    });

    return {
      nativeTotalReleased,
      tokens,
      isComplete: contractResults.every(result => result.status === "success"),
    };
  } catch (error) {
    console.error("Error fetching token data:", error);
    return NO_RELEASED_OR_TOKEN_TOTALS;
  }
}

export async function readRewardsTotals(
  config: Config,
  query: TotalRewardsQuery,
  tokenAddressesLookup: Promise<Address[]>,
): Promise<RewardsTotalsRead> {
  const [nativeBalance, { nativeTotalReleased, tokens, isComplete }] = await Promise.all([
    getBalance(config, { address: query.rewardsModuleAddress, chainId: query.chainId }),
    readReleasedAndTokenTotals(config, query, tokenAddressesLookup),
  ]);

  const nativeTotal = nativeBalance.value + nativeTotalReleased;

  return {
    totals: {
      native: {
        value: nativeTotal,
        formatted: formatUnits(nativeTotal, 18),
        symbol: nativeBalance.symbol || "ETH",
        decimals: 18,
      },
      tokens,
    },
    isComplete,
  };
}

export async function readContestPool(
  config: Config,
  contest: ContestContract,
  lookupTokens: RewardTokensLookup,
): Promise<ContestPoolRead> {
  const rewardsModuleAddress = await readOfficialRewardsModule(config, contest);
  if (!rewardsModuleAddress) return { status: "none" };

  const chainName = findRewardTokensChainName(contest.chainId);
  if (!chainName) console.warn(`Chain with ID ${contest.chainId} not found, using only native rewards`);

  const tokenListLookup = (chainName ? lookupTokens(rewardsModuleAddress, chainName) : Promise.resolve([])).then(
    tokenAddresses => ({ tokenAddresses: tokenAddresses as Address[], isTokenListKnown: true }),
    (error: unknown) => {
      console.error(`Failed to look up reward tokens for ${rewardsModuleAddress}:`, error);
      return { tokenAddresses: [] as Address[], isTokenListKnown: false };
    },
  );

  const verification = await verifyRewardsModule(config, rewardsModuleAddress, contest.chainId);
  if (verification.status !== "verified") return { status: "unverified" };

  const { tokenAddresses, isTokenListKnown } = await tokenListLookup;
  const { totals, isComplete } = await readRewardsTotals(
    config,
    { rewardsModuleAddress, rewardsModuleAbi: verification.abi, chainId: contest.chainId },
    Promise.resolve(tokenAddresses),
  );

  return { status: "read", totals, isComplete: isComplete && isTokenListKnown };
}
