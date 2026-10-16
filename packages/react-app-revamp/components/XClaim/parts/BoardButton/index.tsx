import XLogoIcon from "@components/UI/Icons/XLogo";
import { useXClaimBoard, type XClaimButtonSpec } from "@components/XClaim/board";
import { BUSY_LABEL, SETTLING_LABEL } from "@components/XClaim/copy";
import Link from "next/link";
import { FC } from "react";

export type BoardButtonTone = "primary" | "text" | "outline" | "link";

interface BoardButtonProps {
  spec: XClaimButtonSpec;
  tone: BoardButtonTone;
}

const BLOCK_CLASS = "flex items-center justify-center gap-2";

const TONE_CLASS: Readonly<Record<BoardButtonTone, string>> = {
  primary: `${BLOCK_CLASS} h-[52px] w-full rounded-full bg-secondary-11 text-[17px] font-black text-true-black`,
  text: `${BLOCK_CLASS} h-11 w-full text-[16px] font-bold text-neutral-9`,
  outline: `${BLOCK_CLASS} h-[52px] w-full rounded-full border border-primary-3 text-[15px] font-bold text-neutral-11`,
  link: "inline font-bold text-secondary-11 hover:underline",
};

const BASE_CLASS = "transition-opacity disabled:cursor-default disabled:opacity-60";

const BoardButton: FC<BoardButtonProps> = ({ spec, tone }) => {
  const { action, settling, close } = useXClaimBoard();
  const className = `${BASE_CLASS} ${TONE_CLASS[tone]}`;

  if (spec.kind === "link") {
    return (
      <Link id={spec.id} href={spec.href} onClick={close} className={className}>
        {spec.label}
      </Link>
    );
  }

  if (spec.kind === "close") {
    return (
      <button id={spec.id} type="button" onClick={close} className={className}>
        {spec.label}
      </button>
    );
  }

  const busyLabel = action.stage === "idle" ? (settling ? SETTLING_LABEL : null) : BUSY_LABEL[action.stage];

  return (
    <button
      id={spec.id}
      type="button"
      disabled={busyLabel !== null}
      aria-busy={busyLabel !== null}
      onClick={() => spec.onPress()}
      className={className}
    >
      {spec.withXLogo && !busyLabel && <XLogoIcon size={16} />}
      {busyLabel ?? spec.label}
    </button>
  );
};

export default BoardButton;
