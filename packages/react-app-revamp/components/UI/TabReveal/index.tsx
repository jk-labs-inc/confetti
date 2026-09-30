import { motion, useReducedMotion } from "motion/react";
import { FC, ReactNode, useState } from "react";

interface TabRevealProps {
  tabKey: string;
  className?: string;
  children: ReactNode;
}

const REVEAL_RISE_PX = 4;
const REVEAL_TRANSITION = { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as const;
const FADE_AND_RISE = { opacity: 0, y: REVEAL_RISE_PX };
const FADE_ONLY = { opacity: 0 };
const SETTLED = { opacity: 1, y: 0 };

const TabReveal: FC<TabRevealProps> = ({ tabKey, className, children }) => {
  const reduceMotion = useReducedMotion();
  const [mountedTabKey] = useState(tabKey);
  const [hasSwitched, setHasSwitched] = useState(false);

  if (!hasSwitched && tabKey !== mountedTabKey) setHasSwitched(true);

  return (
    <motion.div
      key={tabKey}
      initial={hasSwitched ? (reduceMotion ? FADE_ONLY : FADE_AND_RISE) : false}
      animate={SETTLED}
      transition={REVEAL_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default TabReveal;
