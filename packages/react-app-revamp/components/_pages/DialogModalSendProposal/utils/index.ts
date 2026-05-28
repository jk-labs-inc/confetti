import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { MetadataFieldWithInput } from "@hooks/useMetadataFields/store";

export const isEntryPreviewPrompt = (prompt: string): boolean =>
  Object.values(EntryPreview).some(value => prompt.startsWith(value));

export const verifyEntryPreviewPrompt = (
  prompt: string,
): {
  enabledPreview: EntryPreview | null;
} => {
  const enabledPreview = Object.values(EntryPreview).find(preview => prompt.startsWith(preview)) || null;

  return {
    enabledPreview,
  };
};

export const isAnyMetadataFieldEmpty = (fields: MetadataFieldWithInput[]): boolean => {
  if (fields.length === 0) return false;
  return fields.some(field => field.inputValue === "");
};
