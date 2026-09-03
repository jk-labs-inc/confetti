import XLogoIcon from "@components/UI/Icons/XLogo";
import { motion } from "motion/react";
import { FC } from "react";
import { VOTE_SHARE_TRACKING_ID } from "../../constants";
import { VOTE_SHARE_COPY } from "../../copy";

interface ShareOnXButtonProps {
  href: string;
}

const ShareOnXButton: FC<ShareOnXButtonProps> = ({ href }) => (
  <motion.a
    id={VOTE_SHARE_TRACKING_ID}
    href={href}
    target="_blank"
    rel="noreferrer"
    className="normal-case flex h-12 w-full items-center justify-center gap-3 rounded-[40px] bg-gradient-purple text-[16px] font-bold text-true-black"
    style={{ willChange: "transform" }}
    whileTap={{ scale: 0.97 }}
  >
    <XLogoIcon size={20} />
    {VOTE_SHARE_COPY.cta}
  </motion.a>
);

export default ShareOnXButton;
