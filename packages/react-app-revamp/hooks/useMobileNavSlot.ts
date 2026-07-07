import { useEffect, useState } from "react";

export const MOBILE_NAV_SLOT_ID = "mobile-create-nav-slot";

export const useMobileNavSlot = (enabled = true): HTMLElement | null => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSlot(null);
      return;
    }

    const existing = document.getElementById(MOBILE_NAV_SLOT_ID);
    if (existing) {
      setSlot(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.getElementById(MOBILE_NAV_SLOT_ID);
      if (el) {
        setSlot(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);

  return slot;
};

export default useMobileNavSlot;
