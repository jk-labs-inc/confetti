import { motion } from "motion/react";
import { FC } from "react";
import { getSuccessCopy } from "../../copy";
import { TransactionOverlayFlow, TransactionOverlayPlacement, TransactionOverlaySuccessMeta } from "../../types";
import SuccessBurst from "../SuccessBurst";

interface SuccessViewProps {
  flow: TransactionOverlayFlow;
  meta: TransactionOverlaySuccessMeta | null;
  placement: TransactionOverlayPlacement;
}

const SuccessView: FC<SuccessViewProps> = ({ flow, meta, placement }) => {
  const compact = placement === TransactionOverlayPlacement.INLINE;

  return (
    <div
      className={`relative flex flex-col items-center ${compact ? "gap-8" : "gap-10"}`}
      id={meta?.id}
      {...meta?.dataAttributes}
    >
      <SuccessBurst />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <motion.img
          src="/landing/bubbles-money.png"
          width={compact ? 160 : 200}
          alt=""
          draggable={false}
          className="h-auto"
          animate={{ y: [0, -10, 0], rotate: [0, 2.5, 0, -2.5, 0] }}
          transition={{
            y: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </motion.div>
      <motion.p
        className="text-center font-sabo-filled text-[24px] text-neutral-11"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
      >
        {getSuccessCopy(flow)}
      </motion.p>
    </div>
  );
};

export default SuccessView;
