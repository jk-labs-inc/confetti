import { useEffect, useState } from "react";

const STANDALONE_DISPLAY_MODE_QUERY = "(display-mode: standalone)";

export const useIsStandalonePwa = (): boolean => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(STANDALONE_DISPLAY_MODE_QUERY);
    const sync = (event: MediaQueryList | MediaQueryListEvent) => setIsStandalone(event.matches);

    sync(mediaQueryList);
    mediaQueryList.addEventListener("change", sync);
    return () => mediaQueryList.removeEventListener("change", sync);
  }, []);

  return isStandalone;
};

export default useIsStandalonePwa;
