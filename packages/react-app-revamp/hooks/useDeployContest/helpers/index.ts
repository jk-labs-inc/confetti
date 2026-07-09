import { EntryPreview, EntryPreviewConfig } from "../slices/contestMetadataSlice";

// tweet contests are deprecated: existing ones still render, but "TWEET" is no longer deployable
export type ContestEntryType = "TEXT" | "IMAGE";

export function getContestEntryType(config: EntryPreviewConfig): ContestEntryType {
  switch (config.preview) {
    case EntryPreview.IMAGE:
    case EntryPreview.IMAGE_AND_TITLE:
      return "IMAGE";
    case EntryPreview.TITLE:
    default:
      return "TEXT";
  }
}
