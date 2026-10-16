import {
  useXClaimBoard,
  type XClaimButtonSpec,
  type XClaimDismissLabel,
  type XClaimLayout,
  type XClaimSecondarySpec,
} from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { FC, ReactNode } from "react";
import ActionErrorLine from "../ActionErrorLine";
import BoardButton from "../BoardButton";

interface BoardLayoutProps {
  width: "claim" | "result";
  titleSize: "large" | "regular";
  spacing?: "regular" | "roomy" | "roomier";
  hero: ReactNode;
  title: string;
  body: ReactNode;
  children?: ReactNode;
  note?: string;
  primary?: XClaimButtonSpec;
  secondary?: XClaimSecondarySpec;
  finePrint?: string;
  footer?: ReactNode;
}

const DISMISS_IDS: Readonly<Record<XClaimDismissLabel, string>> = {
  "maybe later": X_CLAIM_IDS.maybeLater,
  close: X_CLAIM_IDS.close,
  done: X_CLAIM_IDS.done,
};

const GAP_CLASS = {
  regular: "gap-[18px]",
  roomy: "gap-5",
  roomier: "gap-[22px]",
} as const;

const TITLE_CLASS: Readonly<Record<XClaimLayout, Record<BoardLayoutProps["titleSize"], string>>> = {
  sheet: { large: "text-[30px]", regular: "text-[28px]" },
  modal: { large: "text-[32px]", regular: "text-[30px]" },
};

const WIDTH_CLASS = {
  claim: "w-[460px]",
  result: "w-[440px]",
} as const;

const surfaceClass = ({
  layout,
  width,
  hasPrimary,
}: {
  layout: XClaimLayout;
  width: BoardLayoutProps["width"];
  hasPrimary: boolean;
}) => {
  if (layout === "modal") {
    return `relative max-w-full rounded-[28px] bg-true-black px-8 ${WIDTH_CLASS[width]} ${hasPrimary ? "pt-7 pb-8" : "pt-8 pb-9"}`;
  }
  return `px-6 pt-2.5 ${hasPrimary ? "pb-[calc(28px+env(safe-area-inset-bottom))]" : "pb-[calc(44px+env(safe-area-inset-bottom))]"}`;
};

const dismissAsButton = (label: XClaimDismissLabel): XClaimButtonSpec => ({
  kind: "close",
  id: DISMISS_IDS[label],
  label,
});

const BoardLayout: FC<BoardLayoutProps> = ({
  width,
  titleSize,
  spacing = "regular",
  hero,
  title,
  body,
  children,
  note,
  primary,
  secondary,
  finePrint,
  footer,
}) => {
  const { board, layout, action, close } = useXClaimBoard();
  const isModal = layout === "modal";
  const alternative = secondary?.role === "alternative" ? secondary : null;
  const sheetSecondary = secondary
    ? secondary.role === "dismiss"
      ? dismissAsButton(secondary.label)
      : secondary
    : null;

  return (
    <div
      data-x-claim-board={board}
      data-layout={layout}
      className={`flex flex-col text-center text-neutral-11 ${GAP_CLASS[spacing]} ${surfaceClass({
        layout,
        width,
        hasPrimary: !!primary,
      })}`}
    >
      {isModal && primary && (
        <button
          id={X_CLAIM_IDS.modalClose}
          type="button"
          aria-label="close"
          autoFocus
          onClick={close}
          className="absolute top-4 right-4 flex size-11 items-center justify-center"
        >
          <img src="/modal/modal_close.svg" alt="" width={24} height={23} />
        </button>
      )}

      {hero}

      <div className="flex flex-col items-center gap-2">
        <h2 className={`font-sabo-filled leading-[1.1] font-normal ${TITLE_CLASS[layout][titleSize]}`}>{title}</h2>
        <p className="text-[16px] leading-[1.45] text-neutral-9">{body}</p>
      </div>

      {children}

      {note && <p className="text-center text-[14px] leading-[1.45] text-neutral-9">{note}</p>}

      <ActionErrorLine error={action.error} />

      {isModal && primary && alternative && (
        <div className="flex gap-3 *:flex-1">
          <BoardButton spec={{ ...alternative, label: alternative.modalLabel ?? alternative.label }} tone="outline" />
          <BoardButton spec={primary} tone="primary" />
        </div>
      )}
      {isModal && primary && !alternative && <BoardButton spec={primary} tone="primary" />}
      {!isModal && (primary || sheetSecondary) && (
        <div className="flex flex-col gap-0.5">
          {primary && <BoardButton spec={primary} tone="primary" />}
          {sheetSecondary && <BoardButton spec={sheetSecondary} tone="text" />}
        </div>
      )}

      {footer && <div className="text-center text-[13px] leading-[1.5] text-neutral-9">{footer}</div>}
      {finePrint && <p className="text-center text-[12px] leading-[1.5] text-neutral-13">{finePrint}</p>}
    </div>
  );
};

export default BoardLayout;
