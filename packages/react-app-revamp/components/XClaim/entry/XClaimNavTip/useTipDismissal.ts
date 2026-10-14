import { readTipDismissed, rememberTipDismissed } from "lib/xClaim/memory";
import { useCallback, useEffect, useState } from "react";

export const useTipDismissal = () => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(readTipDismissed());
  }, []);

  const dismiss = useCallback(() => {
    rememberTipDismissed();
    setIsDismissed(true);
  }, []);

  return { isDismissed, dismiss };
};
