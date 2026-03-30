import { Tweet } from "@helpers/isContentTweet";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";
import { RawMetadataFields } from "./utils";

export interface ProposalCore {
  id: string;
  author: string;
  description: string;
  exists: boolean;
  rank: number;
  isTied: boolean;
  netVotes: number;
  isContentImage: boolean;
  tweet: Tweet;
  commentsCount: number;
  fieldsMetadata: RawMetadataFields;
}

export interface MappedProposalIds {
  id: string;
  votes: number;
}

interface ProposalState {
  initialMappedProposalIds: MappedProposalIds[];
  listProposalsIds: string[];
  listProposalsData: ProposalCore[];
  isListProposalsLoading: boolean;
  isListProposalsSuccess: boolean;
  isListProposalsError: string;
  isPageProposalsLoading: boolean;
  isPageProposalsError: string;
  isPageProposalSuccess: boolean;
  indexPaginationProposals: Array<any[]>;
  totalPagesPaginationProposals: number;
  currentPagePaginationProposals: number;
  hasPaginationProposalsNextPage: boolean;
  submissionsCount: number;
  addProposalId: (id: string) => void;
  setInitialMappedProposalIds: (initialList: MappedProposalIds[]) => void;
  setListProposalsIds: (list: string[]) => void;
  setIsListProposalsLoading: (value: boolean) => void;
  setIsListProposalsSuccess: (value: boolean) => void;
  setIsListProposalsError: (value: string) => void;
  setProposalData: (proposals: ProposalCore[]) => void;
  setSubmissionsCount: (value: number) => void;
  setIsPageProposalsLoading: (value: boolean) => void;
  setIsPageProposalsError: (value: string) => void;
  setIsPageProposalsSuccess: (value: boolean) => void;
  setIndexPaginationProposalPerId: (proposals: any[]) => void;
  setTotalPagesPaginationProposals: (value: number) => void;
  setCurrentPagePaginationProposals: (value: number) => void;
  setHasPaginationProposalsNextPage: (value: boolean) => void;
}

export const createProposalStore = () =>
  createStore<ProposalState>(set => ({
    initialMappedProposalIds: [],
    listProposalsIds: [],
    listProposalsData: [],
    isListProposalsLoading: false,
    isListProposalsSuccess: false,
    isListProposalsError: "",
    isPageProposalsLoading: false,
    isPageProposalsError: "",
    isPageProposalSuccess: false,
    indexPaginationProposals: [],
    totalPagesPaginationProposals: 0,
    currentPagePaginationProposals: 0,
    hasPaginationProposalsNextPage: false,
    submissionsCount: 0,
    setSubmissionsCount: value => set({ submissionsCount: value }),
    setIsPageProposalsLoading: value => set({ isPageProposalsLoading: value }),
    setIsPageProposalsSuccess: value => set({ isPageProposalSuccess: value }),
    setIsPageProposalsError: value => set({ isPageProposalsError: value }),
    setCurrentPagePaginationProposals: currentPage =>
      set({
        currentPagePaginationProposals: currentPage,
      }),
    setIndexPaginationProposalPerId: proposalsPages =>
      set({
        indexPaginationProposals: proposalsPages,
      }),
    setTotalPagesPaginationProposals: newTotal => set({ totalPagesPaginationProposals: newTotal }),
    setHasPaginationProposalsNextPage: hasNextPage => set({ hasPaginationProposalsNextPage: hasNextPage }),
    addProposalId: id => set(state => ({ listProposalsIds: [...state.listProposalsIds, id] })),
    setIsListProposalsLoading: value => set({ isListProposalsLoading: value }),
    setIsListProposalsError: value => set({ isListProposalsError: value }),
    setIsListProposalsSuccess: value => set({ isListProposalsSuccess: value }),
    setListProposalsIds: list => set({ listProposalsIds: list }),
    setInitialMappedProposalIds: initialList => set({ initialMappedProposalIds: initialList }),
    setProposalData: proposals => set({ listProposalsData: proposals }),
  }));

export const ProposalContext = createContext<ReturnType<typeof createProposalStore> | null>(null);

export function ProposalWrapper({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createProposalStore>>(createProposalStore());
  return <ProposalContext.Provider value={storeRef.current}>{children}</ProposalContext.Provider>;
}

export function useProposalStore<T>(selector: (state: ProposalState) => T) {
  const store = useContext(ProposalContext);
  if (store === null) {
    throw new Error("Missing ProposalWrapper in the tree");
  }
  const value = useStore(store, selector);
  return value;
}
