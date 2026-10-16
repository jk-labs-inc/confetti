import { motion } from "motion/react";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

interface XClaimUnclaimedDotProps {
  className: string;
}

const XClaimUnclaimedDot: FC<XClaimUnclaimedDotProps> = ({ className }) => (
  <motion.span
    data-x-claim-dot
    className={`absolute block size-2.5 rounded-full border-2 bg-negative-9 ${className}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    <span className="sr-only">{CLAIM_AMOUNT_LABEL} to claim</span>
  </motion.span>
);

export default XClaimUnclaimedDot;
