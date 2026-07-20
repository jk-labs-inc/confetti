import { motion, useScroll, useTransform } from "motion/react";
import { FC, ReactNode, useRef } from "react";

interface PeekCardProps {
  children: ReactNode;
}

const PeekCard: FC<PeekCardProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.55"],
  });
  // ramp starts at 0.6 so the card is uniformly dim at its resting peek position
  // across device heights (rest progress ≈ 0.44–0.54 depending on viewport)
  const opacity = useTransform(scrollYProgress, [0.6, 1], [0.4, 1]);

  return (
    <motion.div ref={ref} style={{ opacity }} className="md:opacity-100!">
      {children}
    </motion.div>
  );
};

export default PeekCard;
