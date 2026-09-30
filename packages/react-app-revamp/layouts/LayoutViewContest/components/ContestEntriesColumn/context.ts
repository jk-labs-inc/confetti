import { createContext, useContext } from "react";

export const EntriesScrollRootContext = createContext<HTMLElement | null>(null);

export const useEntriesScrollRoot = (): HTMLElement | null => useContext(EntriesScrollRootContext);

export const InEntriesColumnContext = createContext(false);

export const useIsInEntriesColumn = (): boolean => useContext(InEntriesColumnContext);
