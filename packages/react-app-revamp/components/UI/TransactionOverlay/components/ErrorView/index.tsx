import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { motion } from "motion/react";
import { FC } from "react";
import { OVERLAY_TYPE_SCALE } from "../../constants";
import { txOverlay } from "../../store";
import { TransactionOverlayTextSize } from "../../types";

interface ErrorViewProps {
  errorMessage: string;
  textSize: TransactionOverlayTextSize;
}

const ErrorView: FC<ErrorViewProps> = ({ errorMessage, textSize }) => (
  <div className="flex flex-col items-center gap-8 text-center">
    <motion.img
      src="/toast/sadboi.png"
      width={100}
      height={100}
      alt="error"
      draggable={false}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
    <div className="flex flex-col gap-3">
      <p className={`font-sabo-filled ${OVERLAY_TYPE_SCALE[textSize].title} text-neutral-11`}>something went wrong</p>
      {errorMessage && (
        <p className={`max-w-[300px] wrap-break-word ${OVERLAY_TYPE_SCALE[textSize].sub} text-neutral-14`}>
          {errorMessage}
        </p>
      )}
    </div>
    <ButtonV3
      colorClass="bg-gradient-purple rounded-[40px] font-bold text-true-black"
      size={ButtonSize.EXTRA_LARGE}
      onClick={() => txOverlay.dismiss()}
    >
      got it
    </ButtonV3>
  </div>
);

export default ErrorView;
