import { Proposal } from "@components/_pages/ProposalContent";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { ParsedEntry } from "./types";

const extractTweetId = (url: string): string => {
  const match = url?.match(/\/status\/(\d+)/);
  return match ? match[1] : "";
};

export const parseEntry = (proposal: Proposal, enabledPreview: EntryPreview | null): ParsedEntry => {
  const raw = proposal.metadataFields?.stringArray?.[0] ?? "";

  switch (enabledPreview) {
    case EntryPreview.IMAGE:
      return { kind: "image", imageUrl: raw, title: "" };
    case EntryPreview.IMAGE_AND_TITLE: {
      const params = new URLSearchParams(raw);
      return {
        kind: "image",
        imageUrl: params.get("JOKERACE_IMG") || "",
        title: params.get("JOKERACE_IMG_TITLE") || "",
      };
    }
    case EntryPreview.TWEET:
      return { kind: "tweet", tweetId: extractTweetId(raw), title: "" };
    case EntryPreview.TWEET_AND_TITLE: {
      const params = new URLSearchParams(raw);
      return {
        kind: "tweet",
        tweetId: extractTweetId(params.get("JOKERACE_TWEET") || ""),
        title: params.get("JOKERACE_TWEET_TITLE") || "",
      };
    }
    case EntryPreview.TITLE:
    default:
      return { kind: "title", title: raw };
  }
};
