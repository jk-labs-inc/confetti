import { createContext, useContext, useState } from "react";
import { createStore, useStore } from "zustand";
import { VoteCurrency } from "lib/voteCurrency";
import { Abi } from "viem";

export interface ContestConfig {
  address: `0x${string}`;
  abi: Abi;
  chainName: string;
  chainId: number;
  voteCurrency: VoteCurrency;
  version: string;
}

interface ContestConfigStoreState {
  contestConfig: ContestConfig;
  setContestConfig: (contestConfig: ContestConfig) => void;
}

type ContestConfigStoreApi = ReturnType<typeof createContestConfigStore>;

const createContestConfigStore = (initialConfig: ContestConfig) => {
  return createStore<ContestConfigStoreState>(set => ({
    contestConfig: initialConfig,
    setContestConfig: (contestConfig: ContestConfig) => set({ contestConfig }),
  }));
};

const ContestConfigStoreContext = createContext<ContestConfigStoreApi | null>(null);

export const ContestConfigStoreProvider = ({
  children,
  contestConfig,
}: {
  children: React.ReactNode;
  contestConfig: ContestConfig;
}) => {
  const [store] = useState(() => createContestConfigStore(contestConfig));

  return <ContestConfigStoreContext.Provider value={store}>{children}</ContestConfigStoreContext.Provider>;
};

const useContestConfigStore = <T,>(selector: (state: ContestConfigStoreState) => T): T => {
  const store = useContext(ContestConfigStoreContext);
  if (!store) {
    throw new Error("Missing ContestConfigStoreProvider");
  }
  return useStore(store, selector);
};

export default useContestConfigStore;
