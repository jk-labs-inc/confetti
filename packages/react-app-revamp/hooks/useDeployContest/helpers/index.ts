import { EntryPreview, EntryPreviewConfig } from "../slices/contestMetadataSlice";

export type ContestEntryType = "TEXT" | "IMAGE" | "TWEET";

export function getContestEntryType(config: EntryPreviewConfig): ContestEntryType {
  switch (config.preview) {
    case EntryPreview.IMAGE:
    case EntryPreview.IMAGE_AND_TITLE:
      return "IMAGE";
    case EntryPreview.TWEET:
    case EntryPreview.TWEET_AND_TITLE:
      return "TWEET";
    case EntryPreview.TITLE:
    default:
      return "TEXT";
  }
}
