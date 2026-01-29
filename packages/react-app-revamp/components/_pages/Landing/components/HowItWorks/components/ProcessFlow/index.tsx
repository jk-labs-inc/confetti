import { motion, Variants } from "motion/react";
import LandingPageHowItWorksProcessStepContainer from "./components/ProcessStep";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.9,
    },
  },
};

const LandingPageHowItWorksProcessFlow = () => {
  return (
    <motion.div
      className="hidden lg:flex flex-col gap-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      <div className="flex items-center gap-4">
        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <LandingPageHowItWorksProcessStepContainer>
            <img src="/landing/bubbles-ballot.png" alt="step 1" width={120} height={120} />
            <p className="text-neutral-11 font-sabo-filled text-xl 2xl:text-2xl">
              buy votes early <br /> for cheap
            </p>
          </LandingPageHowItWorksProcessStepContainer>
        </motion.div>
        <motion.img
          src="/landing/arrow-right.png"
          alt="arrow right"
          variants={itemVariants}
          style={{ willChange: "transform" }}
        />
        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <LandingPageHowItWorksProcessStepContainer>
            <img src="/landing/money.png" alt="step 2" width={114} height={113} />
            <p className="text-neutral-11 font-sabo-filled text-xl 2xl:text-2xl">
              this funds the <br />
              rewards
            </p>
          </LandingPageHowItWorksProcessStepContainer>
        </motion.div>
        <motion.img
          src="/landing/arrow-right.png"
          alt="arrow right"
          variants={itemVariants}
          style={{ willChange: "transform" }}
        />
        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <LandingPageHowItWorksProcessStepContainer>
            <img src="/landing/bubbles-money.png" alt="step 3" width={114} height={114} />
            <p className="text-neutral-11 font-sabo-filled text-xl 2xl:text-2xl">
              earn by voting <br />
              up winners
            </p>
          </LandingPageHowItWorksProcessStepContainer>
        </motion.div>
      </div>
      <motion.div
        className="bg-neutral-10 w-full h-px origin-left"
        variants={lineVariants}
        style={{ willChange: "transform" }}
      />
    </motion.div>
  );
};

export default LandingPageHowItWorksProcessFlow;
