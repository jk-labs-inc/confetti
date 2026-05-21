import { ReactNode } from "react";

type ReactStyleStateSetter<T> = T | ((prev: T) => T);

export enum EntryPermission {
  ANYONE_CAN_SUBMIT = 1,
  ONLY_CREATOR = 0,
}

export interface MetadataField {
  elementType: "string" | "number";
  metadataType: "string" | "uint256" | "address";
  promptLabel: string;
  prompt: string;
  description: {
    desktop: ReactNode;
    mobile: ReactNode;
  };
}

export enum EntryPreview {
  TITLE = "JOKERACE_TITLE_PREVIEW",
  IMAGE = "JOKERACE_IMAGE_PREVIEW",
  IMAGE_AND_TITLE = "JOKERACE_IMAGE_AND_TITLE_PREVIEW",
  TWEET = "JOKERACE_TWEET_PREVIEW",
  TWEET_AND_TITLE = "JOKERACE_TWEET_AND_TITLE_PREVIEW",
}

export interface EntryPreviewConfig {
  preview: EntryPreview;
  isTitleRequired: boolean;
  isAnyoneCanSubmit: EntryPermission;
}

export interface MetadataSliceState {
  entryPreviewConfig: EntryPreviewConfig;
}

export interface MetadataSliceActions {
  setEntryPreviewConfig: (data: ReactStyleStateSetter<EntryPreviewConfig>) => void;
}

export type MetadataSlice = MetadataSliceState & MetadataSliceActions;

export const createMetadataSlice = (set: any): MetadataSlice => ({
  entryPreviewConfig: {
    preview: EntryPreview.TITLE,
    isTitleRequired: true,
    isAnyoneCanSubmit: EntryPermission.ANYONE_CAN_SUBMIT,
  },

  setEntryPreviewConfig: (data: ReactStyleStateSetter<EntryPreviewConfig>) =>
    set((state: any) => ({
      entryPreviewConfig: typeof data === "function" ? data(state.entryPreviewConfig) : data,
    })),
});
