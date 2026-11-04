import { DESKTOP_HEADER_MIN_WIDTH_PX } from "@helpers/isMobileViewport";
import type { ClaimVoteBoard } from "lib/claimVote/types";
import type { XClaimActionState, XClaimBoard, XClaimCheck, XClaimCheckStatus } from "lib/xClaim/types";
import { createContext, type ReactNode, useContext } from "react";
import { useMediaQuery } from "react-responsive";

export type XClaimLayout = "sheet" | "modal";

export interface XClaimBoardEnv {
  board: XClaimBoard | ClaimVoteBoard;
  layout: XClaimLayout;
  action: XClaimActionState;
  settling: boolean;
  close: () => void;
}

export const XClaimBoardContext = createContext<XClaimBoardEnv | null>(null);

export const useXClaimBoard = (): XClaimBoardEnv => {
  const env = useContext(XClaimBoardContext);
  if (!env) throw new Error("useXClaimBoard must be used inside XClaimSheetContent");
  return env;
};

export const useViewportLayout = (): XClaimLayout =>
  useMediaQuery({ minWidth: DESKTOP_HEADER_MIN_WIDTH_PX }) ? "modal" : "sheet";

export type XClaimButtonSpec = { id: string; label: string } & (
  { kind: "run"; onPress: () => void; withXLogo?: boolean } | { kind: "link"; href: string } | { kind: "close" }
);

export interface XClaimJustVote {
  onPress: () => void;
  note: string;
  ownAmount: string;
  totalAmount: string | null;
}

export type XClaimDismissLabel = "maybe later" | "close" | "done";

export type XClaimSecondarySpec =
  | { role: "dismiss"; label: XClaimDismissLabel }
  | ({ role: "alternative"; modalLabel?: string; isStrong?: boolean } & XClaimButtonSpec);

export interface XClaimPromptExtras {
  secondary?: XClaimSecondarySpec;
  footer: ReactNode;
}

export type CheckStickerState = XClaimCheckStatus | "todo" | "running" | "queued";

export type CheckStickerStates = Readonly<Record<XClaimCheck, CheckStickerState>>;

export const TODO_CHECKS: CheckStickerStates = { verified: "todo", verifiedFollowers: "todo", ratio: "todo" };
