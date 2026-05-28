import { EntryPreview, EntryPreviewConfig } from "../slices/contestMetadataSlice";

export function createMetadataFieldsSchema(entryPreviewConfig: EntryPreviewConfig): string {
  return JSON.stringify({
    string: [getEntryPreviewPrompt(entryPreviewConfig)],
  });
}

export function getEntryPreviewPrompt(config: EntryPreviewConfig): string {
  const { preview } = config;

  if (config.isTitleRequired) {
    if (preview === EntryPreview.IMAGE) {
      return EntryPreview.IMAGE_AND_TITLE;
    } else if (preview === EntryPreview.TWEET) {
      return EntryPreview.TWEET_AND_TITLE;
    }
  }

  return preview;
}
