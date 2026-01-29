import { motion, Variants } from "motion/react";
import CreateContests from "./components/CreateContests";
import FundsDistribution from "./components/FundsDistribution";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const LandingPageHowItWorksCreatorRewards = () => {
  return (
    <motion.div
      className="flex flex-col gap-12 lg:flex-row lg:gap-8 2xl:gap-12 lg:items-start"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="w-full lg:w-1/2" style={{ willChange: "transform" }}>
        <CreateContests />
      </motion.div>
      <motion.div variants={itemVariants} className="hidden 2xl:block 2xl:w-1/2" style={{ willChange: "transform" }}>
        <FundsDistribution />
      </motion.div>
    </motion.div>
  );
};

export default LandingPageHowItWorksCreatorRewards;
