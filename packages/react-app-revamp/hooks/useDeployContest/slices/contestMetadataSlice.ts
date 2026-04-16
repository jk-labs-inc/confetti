import { ReactNode } from "react";
import { metadataFields } from "@components/_pages/Create/pages/ContestParams/components/Metadata/components/Fields/utils";

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
  metadataToggle: boolean;
  metadataFields: MetadataField[];
  entryPreviewConfig: EntryPreviewConfig;
}

export interface MetadataSliceActions {
  setMetadataToggle: (toggle: boolean) => void;
  setMetadataFields: (data: ReactStyleStateSetter<MetadataField[]>) => void;
  setEntryPreviewConfig: (data: ReactStyleStateSetter<EntryPreviewConfig>) => void;
}

export type MetadataSlice = MetadataSliceState & MetadataSliceActions;

export const createMetadataSlice = (set: any): MetadataSlice => ({
  metadataToggle: false,
  metadataFields: metadataFields.slice(0, 1),
  entryPreviewConfig: {
    preview: EntryPreview.IMAGE,
    isTitleRequired: true,
    isAnyoneCanSubmit: EntryPermission.ANYONE_CAN_SUBMIT,
  },

  setMetadataToggle: (toggle: boolean) => set({ metadataToggle: toggle }),
  setMetadataFields: (data: ReactStyleStateSetter<MetadataField[]>) =>
    set((state: any) => ({
      metadataFields: typeof data === "function" ? data(state.metadataFields) : data,
    })),
  setEntryPreviewConfig: (data: ReactStyleStateSetter<EntryPreviewConfig>) =>
    set((state: any) => ({
      entryPreviewConfig: typeof data === "function" ? data(state.entryPreviewConfig) : data,
    })),
});
