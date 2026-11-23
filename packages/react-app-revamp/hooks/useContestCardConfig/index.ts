import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { safeCompareVersions } from "@helpers/versions";
import { ENTRY_TYPE_TOKEN_TO_PREVIEW } from "@hooks/useContestEntryType";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { parseMetadataFieldsSchema } from "@hooks/useMetadataFields/helpers";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { CONTEST_ENTRY_TYPE_VERSION, METADATA_FIELDS_VERSION } from "constants/versions";
import { readContestVoteCurrency, VoteCurrency } from "lib/voteCurrency";
import { Abi } from "viem";

export interface ContestCardConfig {
  address: `0x${string}`;
  abi: Abi;
  version: string;
  chainId: number;
  chainName: string;
  isLegacy: boolean;
  hasDownvotes: boolean;
  enabledPreview: EntryPreview | null;
  voteCurrency: VoteCurrency;
}

interface UseContestCardConfigParams {
  address: string;
  chainName: string;
  enabled?: boolean;
}

async function readEnabledPreview(
  address: `0x${string}`,
  abi: Abi,
  chainId: number,
  version: string,
): Promise<EntryPreview | null> {
  if ((safeCompareVersions(version, CONTEST_ENTRY_TYPE_VERSION) ?? -1) >= 0) {
    try {
      const entryType = await readContract(getWagmiConfig(), {
        address,
        abi,
        chainId,
        functionName: "contestEntryType",
        args: [],
      });
      return ENTRY_TYPE_TOKEN_TO_PREVIEW[entryType as string] ?? EntryPreview.TITLE;
    } catch {
      return EntryPreview.TITLE;
    }
  }

  if ((safeCompareVersions(version, METADATA_FIELDS_VERSION) ?? -1) >= 0) {
    try {
      const schema = await readContract(getWagmiConfig(), {
        address,
        abi,
        chainId,
        functionName: "metadataFieldsSchema",
        args: [],
      });
      if (typeof schema === "string") {
        const fields = parseMetadataFieldsSchema(schema);
        return fields.length > 0 ? verifyEntryPreviewPrompt(fields[0].prompt).enabledPreview : null;
      }
    } catch {
      // no readable schema — getEntryPreview falls back to the entry description as title.
    }
  }

  return null;
}

async function fetchContestCardConfig(
  address: `0x${string}`,
  chainId: number,
  chainName: string,
): Promise<ContestCardConfig> {
  const { abi, version } = await getContestContractVersion(address, chainId);
  if (!abi || version === "error") {
    throw new Error(`could not resolve contract version for ${address} on chain ${chainName}`);
  }

  const isLegacy = !(abi as Abi).some(entry => entry.type === "function" && entry.name === "allProposalTotalVotes");
  const hasDownvotes = (safeCompareVersions(version, "5.1") ?? 0) < 0;

  const [enabledPreview, voteCurrency] = await Promise.all([
    readEnabledPreview(address, abi as Abi, chainId, version),
    readContestVoteCurrency(getWagmiConfig(), { address, abi: abi as Abi, chainId, version }),
  ]);

  return { address, abi, version, chainId, chainName, isLegacy, hasDownvotes, enabledPreview, voteCurrency };
}

/**
 * everything immutable a landing card needs to talk to a contest contract (abi, version,
 * entry-preview type) in one cached-forever query — usable outside the contest page's provider tree.
 */
export function useContestCardConfig({ address, chainName, enabled = true }: UseContestCardConfigParams) {
  const chainId = chains.find(chain => chain.name.toLowerCase() === chainName?.toLowerCase())?.id;

  const {
    data: config,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contestCardConfig", address?.toLowerCase(), chainId],
    queryFn: () => fetchContestCardConfig(address as `0x${string}`, chainId as number, chainName),
    enabled: enabled && !!address && !!chainId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { config, isLoading, isError };
}

export default useContestCardConfig;
