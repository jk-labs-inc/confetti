import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";

export interface EntryPreviewInfo {
  image?: string;
  title?: string;
}

interface MetadataLike {
  stringArray?: string[];
}

interface ProposalLike {
  description?: string;
  metadataFields?: MetadataLike;
  fieldsMetadata?: MetadataLike;
}

export const getEntryPreview = (
  proposal: ProposalLike | undefined,
  enabledPreview: EntryPreview | null,
): EntryPreviewInfo => {
  if (!proposal) return {};
  const raw = proposal.metadataFields?.stringArray?.[0] ?? proposal.fieldsMetadata?.stringArray?.[0] ?? "";

  switch (enabledPreview) {
    case EntryPreview.IMAGE:
      return { image: raw };
    case EntryPreview.IMAGE_AND_TITLE: {
      const params = new URLSearchParams(raw);
      return {
        image: params.get("JOKERACE_IMG") ?? undefined,
        title: params.get("JOKERACE_IMG_TITLE") ?? undefined,
      };
    }
    case EntryPreview.TWEET_AND_TITLE: {
      const params = new URLSearchParams(raw);
      return { title: params.get("JOKERACE_TWEET_TITLE") ?? undefined };
    }
    case EntryPreview.TWEET:
      return { title: raw };
    case EntryPreview.TITLE:
      return { title: raw };
    default:
      return { title: proposal.description };
  }
};
