import { createContext, useContext } from "react";

export interface EntryVotersSheetContextValue {
  openFor: (proposalId: string) => void;
  close: () => void;
}

const NOOP = () => {};

export const EntryVotersSheetContext = createContext<EntryVotersSheetContextValue>({ openFor: NOOP, close: NOOP });

export const useEntryVotersSheet = (): EntryVotersSheetContextValue => useContext(EntryVotersSheetContext);
