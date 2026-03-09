import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useQuery } from "@tanstack/react-query";
import { compareVersions } from "compare-versions";
import { readContracts } from "@wagmi/core";
import { getRewardsModuleAddress, getRewardsModuleInfo } from "lib/rewards/contracts";
import { ModuleType, RewardModuleInfo } from "lib/rewards/types";
import { Abi } from "viem";

const SELF_FUNDED_VERSION = "6.9";

export function useRewardsModule() {
  const { contestConfig } = useContestConfigStore(state => state);

  const getRewardsConfig = (rewardsModuleAddress: string, abi: Abi) => ({
    address: rewardsModuleAddress as `0x${string}`,
    abi: abi as Abi,
    chainId: contestConfig.chainId,
  });

  const fetchContestRewardsModule = async (): Promise<RewardModuleInfo | null> => {
    if (!contestConfig.address || !contestConfig.abi || !contestConfig.chainId) {
      return null;
    }

    const rewardsConfig = getRewardsConfig(contestConfig.address as `0x${string}`, contestConfig.abi);

    const rewardsModuleAddress = await getRewardsModuleAddress(rewardsConfig);
    if (!rewardsModuleAddress) {
      return null;
    }

    const { abi, moduleType } = await getRewardsModuleInfo(rewardsModuleAddress, contestConfig.chainId);
    if (!abi) {
      return null;
    }

    const isVersionBelowSelfFunded =
      contestConfig.version && compareVersions(contestConfig.version, SELF_FUNDED_VERSION) < 0;

    const contractsRewardsModule = [
      {
        ...getRewardsConfig(rewardsModuleAddress, abi),
        functionName: "creator",
      },
      {
        ...getRewardsConfig(rewardsModuleAddress, abi),
        functionName: "getPayees",
      },
      {
        ...getRewardsConfig(rewardsModuleAddress, abi),
        functionName: "totalShares",
      },
      ...(isVersionBelowSelfFunded
        ? [
            {
              ...contestConfig,
              functionName: "creatorSplitDestination",
            },
          ]
        : []),
    ];

    const rewardsModule = await readContracts(getWagmiConfig(), {
      contracts: contractsRewardsModule,
    });

    const creator = rewardsModule[0].result as string;
    const payeeRankings = rewardsModule[1].result as bigint[];
    const totalShares = rewardsModule[2].result as bigint;
    const creatorSplitDestination = isVersionBelowSelfFunded
      ? (rewardsModule[3]?.result as string)
      : rewardsModuleAddress;
    const shareContracts = payeeRankings.map(ranking => ({
      ...getRewardsConfig(rewardsModuleAddress, abi),
      functionName: "shares",
      args: [ranking],
    }));

    const sharesResults = await readContracts(getWagmiConfig(), {
      contracts: shareContracts,
    });

    const formattedPayees = payeeRankings.map(payee => Number(payee));
    const formattedPayeeShares = sharesResults.map(result => Number(result.result as bigint));
    const totalSharesFormatted = Number(totalShares);
    const isSelfFunded =
      !isVersionBelowSelfFunded || creatorSplitDestination.toLowerCase() === rewardsModuleAddress.toLowerCase();

    return {
      abi,
      contractAddress: rewardsModuleAddress,
      creator,
      payees: formattedPayees,
      payeeShares: formattedPayeeShares,
      totalShares: totalSharesFormatted,
      moduleType: moduleType ?? ModuleType.VOTER_REWARDS,
      blockExplorers: chains.filter(
        (chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === contestConfig.chainName,
      )?.[0]?.blockExplorers?.default.url,
      isSelfFunded,
    };
  };

  return useQuery({
    queryKey: [
      "rewards-module",
      contestConfig.address,
      contestConfig.abi,
      contestConfig.chainId,
      contestConfig.version,
    ],
    queryFn: fetchContestRewardsModule,
    enabled: Boolean(contestConfig.address && contestConfig.abi && contestConfig.chainId),
    staleTime: Infinity,
  });
}

export default useRewardsModule;
