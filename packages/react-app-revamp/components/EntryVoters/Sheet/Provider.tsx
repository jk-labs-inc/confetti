import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import EntryVotersSheet from "./index";
import { EntryVotersSheetContext, EntryVotersSheetContextValue } from "./context";

interface EntryVotersSheetProviderProps {
  children: ReactNode;
}

const EntryVotersSheetProvider: FC<EntryVotersSheetProviderProps> = ({ children }) => {
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openFor = useCallback((id: string) => {
    setProposalId(id);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo<EntryVotersSheetContextValue>(() => ({ openFor, close }), [openFor, close]);

  return (
    <EntryVotersSheetContext.Provider value={value}>
      {children}
      <EntryVotersSheet proposalId={proposalId} isOpen={isOpen} onClose={close} />
    </EntryVotersSheetContext.Provider>
  );
};

export default EntryVotersSheetProvider;
