import useRewardsIndicator from "@hooks/useRewardsIndicator";
import { motion } from "motion/react";

const RewardsTabIndicator = () => {
  const hasReleasableRewards = useRewardsIndicator();

  if (!hasReleasableRewards) return null;

  return (
    <motion.span
      className="block w-2 h-2 rounded-full bg-negative-9"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    />
  );
};

export default RewardsTabIndicator;
