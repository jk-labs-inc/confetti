import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { MetadataFieldWithInput } from "@hooks/useMetadataFields/store";
import { parseEther } from "viem";

export function processFieldInputs(fieldInputs: MetadataFieldWithInput[]) {
  const fieldsMetadata = {
    addressArray: [] as `0x${string}`[],
    stringArray: [] as string[],
    uintArray: [] as bigint[],
  };

  fieldInputs.forEach(field => {
    switch (field.metadataType) {
      case "address":
        fieldsMetadata.addressArray.push(field.inputValue as `0x${string}`);
        break;
      case "string":
        fieldsMetadata.stringArray.push(field.inputValue);
        break;
      case "uint256":
        fieldsMetadata.uintArray.push(parseEther(field.inputValue));
        break;
      default:
        console.warn(`Unsupported metadata type: ${field.metadataType}`);
    }
  });

  return fieldsMetadata;
}

export function generateEntryPreviewHTML(fieldInputs: MetadataFieldWithInput[]): string {
  if (fieldInputs.length === 0) {
    return "";
  }

  const firstFieldInput = fieldInputs[0];
  const { enabledPreview } = verifyEntryPreviewPrompt(firstFieldInput.prompt);

  let previewHTML = "";
  switch (enabledPreview) {
    case EntryPreview.TITLE:
      previewHTML = `<p style="font-size: 24px; color: #E5E5E5; font-weight: 600;" id="entry-preview-title">${firstFieldInput.inputValue}</p>`;
      break;
    case EntryPreview.IMAGE:
      previewHTML = `<img src="${firstFieldInput.inputValue}" alt="Preview Image" />`;
      break;
    case EntryPreview.IMAGE_AND_TITLE: {
      const params = new URLSearchParams(firstFieldInput.inputValue);
      const imageUrl = params.get("JOKERACE_IMG") || "";
      const title = params.get("JOKERACE_IMG_TITLE") || "";

      previewHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <p style="font-size: 24px; color: #E5E5E5; font-weight: 600;" id="entry-preview-title">${title}</p>
            <img src="${imageUrl}" alt="Preview Image" style="max-width: 100%; border-radius: 8px;" />
          </div>`;
      break;
    }
    case EntryPreview.TWEET:
      previewHTML = `<a href="${firstFieldInput.inputValue}" target="_blank" rel="noopener noreferrer">${firstFieldInput.inputValue}</a>`;
      break;
    case EntryPreview.TWEET_AND_TITLE:
      const params = new URLSearchParams(firstFieldInput.inputValue);
      const tweet = params.get("JOKERACE_TWEET") || "";
      const title = params.get("JOKERACE_TWEET_TITLE") || "";

      previewHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <p style="font-size: 24px; color: #E5E5E5; font-weight: 600;" id="entry-preview-title">${title}</p>
            <a href="${tweet}" target="_blank" rel="noopener noreferrer">${tweet}</a>
          </div>`;
      break;
    default:
      previewHTML = "";
  }

  return `${previewHTML}`;
}
