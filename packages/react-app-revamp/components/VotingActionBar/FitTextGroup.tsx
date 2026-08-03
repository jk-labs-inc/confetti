import { FC, PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

interface FitTextGroupValue {
  /** Smallest natural fit among the members; every member renders at this size. */
  cap: number | null;
  report: (id: string, size: number | null) => void;
}

const FitTextGroupContext = createContext<FitTextGroupValue | null>(null);

export const useFitTextGroup = () => useContext(FitTextGroupContext);

/** Keeps every `group`-flagged FitText descendant at one font size: the smallest any member fits at. */
const FitTextGroup: FC<PropsWithChildren> = ({ children }) => {
  const [sizes, setSizes] = useState<Record<string, number>>({});

  const report = useCallback((id: string, size: number | null) => {
    setSizes(prev => {
      if (size === null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return prev[id] === size ? prev : { ...prev, [id]: size };
    });
  }, []);

  const members = Object.values(sizes);
  const cap = members.length ? Math.min(...members) : null;
  const value = useMemo(() => ({ cap, report }), [cap, report]);

  return <FitTextGroupContext.Provider value={value}>{children}</FitTextGroupContext.Provider>;
};

export default FitTextGroup;
