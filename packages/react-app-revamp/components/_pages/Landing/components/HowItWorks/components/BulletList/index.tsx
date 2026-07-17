import { motion, Variants } from "motion/react";
import { Children, FC, ReactNode } from "react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

interface BulletListProps {
  children: ReactNode;
  className?: string;
}

const BulletList: FC<BulletListProps> = ({ children, className }) => {
  return (
    <motion.div variants={containerVariants} className={className}>
      {Children.map(children, child => (
        <motion.div variants={lineVariants} className="flex gap-2" style={{ willChange: "transform" }}>
          <span className="font-normal text-neutral-9 select-none">›</span>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BulletList;
