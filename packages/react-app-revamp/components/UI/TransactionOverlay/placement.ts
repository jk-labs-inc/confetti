import { isMobileViewport } from "@helpers/isMobileViewport";
import { TransactionOverlayPlacement } from "./types";

export const resolveOverlayPlacement = (hasInlineHost: boolean | undefined): TransactionOverlayPlacement | null =>
  isMobileViewport()
    ? TransactionOverlayPlacement.FULLSCREEN
    : hasInlineHost
      ? TransactionOverlayPlacement.INLINE
      : null;
