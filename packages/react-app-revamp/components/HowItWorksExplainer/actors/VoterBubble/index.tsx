import { Avatar } from "@components/UI/Avatar";
import { motion, type MotionStyle } from "motion/react";
import { FC } from "react";

interface VoterBubbleProps {
  seed: string;
  sizePx?: number;
  style?: MotionStyle;
}

const VoterBubble: FC<VoterBubbleProps> = ({ seed, sizePx = 28, style }) => (
  <motion.div style={style} className="absolute rounded-full border-2 border-true-black">
    <Avatar src="" address={seed} sizePx={sizePx} />
  </motion.div>
);

export default VoterBubble;
