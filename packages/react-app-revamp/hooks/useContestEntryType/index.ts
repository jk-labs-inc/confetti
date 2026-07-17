import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import useMetadataFields from "@hooks/useMetadataFields";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { safeCompareVersions } from "@helpers/versions";
import { CONTEST_ENTRY_TYPE_VERSION, METADATA_FIELDS_VERSION } from "constants/versions";
import { useEffect } from "react";
import { Abi } from "viem";
import { useReadContract } from "wagmi";
import { useShallow } from "zustand/shallow";

export const ENTRY_TYPE_TOKEN_TO_PREVIEW: Record<string, EntryPreview> = {
  TEXT: EntryPreview.TITLE,
  IMAGE: EntryPreview.IMAGE_AND_TITLE,
  TWEET: EntryPreview.TWEET_AND_TITLE,
};

interface UseContestEntryTypeParams {
  address: `0x${string}`;
  chainId: number;
  abi: Abi;
  version: string;
  enabled?: boolean;
}

interface UseContestEntryTypeResult {
  entryPreview: EntryPreview;
  isLoading: boolean;
  isError: boolean;
}

const useContestEntryType = ({
  address,
  chainId,
  abi,
  version,
  enabled = true,
}: UseContestEntryTypeParams): UseContestEntryTypeResult => {
  const { setFields, firstFieldPrompt } = useMetadataStore(
    useShallow(state => ({
      setFields: state.setFields,
      firstFieldPrompt: state.fields.length > 0 ? state.fields[0].prompt : null,
    })),
  );
  const entryTypeCmp = safeCompareVersions(version, CONTEST_ENTRY_TYPE_VERSION);
  const metadataCmp = safeCompareVersions(version, METADATA_FIELDS_VERSION);

  const isNew = entryTypeCmp !== null && entryTypeCmp >= 0;
  const isLegacy = !isNew && metadataCmp !== null && metadataCmp >= 0;

  const {
    data: newEntryPreview,
    isLoading: isNewLoading,
    isError: isNewError,
  } = useReadContract({
    address,
    abi,
    chainId,
    functionName: "contestEntryType",
    scopeKey: "contestEntryType",
    query: {
      staleTime: Infinity,
      enabled: !!address && !!abi && enabled && isNew,
      select: data => ENTRY_TYPE_TOKEN_TO_PREVIEW[data as string] ?? EntryPreview.TITLE,
    },
  });

  const { isLoading: isLegacyLoading, isError: isLegacyError } = useMetadataFields({
    address,
    chainId,
    abi,
    version,
    enabled: enabled && isLegacy,
  });

  useEffect(() => {
    if (isNew) {
      if (newEntryPreview) {
        setFields([{ metadataType: "string", prompt: newEntryPreview }]);
      }
    } else if (!isLegacy) {
      setFields([]);
    }
  }, [isNew, isLegacy, newEntryPreview, setFields]);

  const entryPreview = isNew
    ? (newEntryPreview ?? EntryPreview.TITLE)
    : isLegacy && firstFieldPrompt
      ? (verifyEntryPreviewPrompt(firstFieldPrompt).enabledPreview ?? EntryPreview.TITLE)
      : EntryPreview.TITLE;

  return {
    entryPreview,
    isLoading: isNew ? isNewLoading : isLegacy ? isLegacyLoading : false,
    isError: isNew ? isNewError : isLegacy ? isLegacyError : false,
  };
};

export default useContestEntryType;
