import { FC } from "react";
import { txOverlay } from "../../store";
import { TransactionOverlayPlacement } from "../../types";

const POSITION_CLASS: Record<TransactionOverlayPlacement, string> = {
  [TransactionOverlayPlacement.FULLSCREEN]: "right-6 top-[calc(env(safe-area-inset-top)_+_1.5rem)]",
  [TransactionOverlayPlacement.INLINE]: "right-6 top-6",
};

interface OverlayCloseButtonProps {
  placement: TransactionOverlayPlacement;
}

const OverlayCloseButton: FC<OverlayCloseButtonProps> = ({ placement }) => (
  <button
    type="button"
    aria-label="close"
    className={`absolute z-10 cursor-pointer ${POSITION_CLASS[placement]}`}
    onClick={() => txOverlay.dismiss()}
  >
    <img src="/modal/modal_close.svg" width={24} height={24} alt="" draggable={false} />
  </button>
);

export default OverlayCloseButton;
