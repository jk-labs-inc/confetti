import { motion } from "motion/react";
import LandingPageHowItWorksCreatorRewards from "./components/CreatorRewards";
import LandingPageHowItWorksEarningBenefits from "./components/EarningBenefits";
import LandingPageHowItWorksProcessFlow from "./components/ProcessFlow";

const LandingPageHowItWorks = () => {
  return (
    <div className="flex flex-col gap-9" id="how-it-works">
      <motion.p
        className="text-neutral-11 lg:text-neutral-9 font-sabo-filled text-2xl"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        how it works
      </motion.p>
      <div className="flex flex-col gap-20 max-w-[1352px]">
        <LandingPageHowItWorksProcessFlow />
        <div className="flex flex-col gap-12 lg:gap-20 2xl:gap-40">
          <LandingPageHowItWorksEarningBenefits />
          <LandingPageHowItWorksCreatorRewards />
        </div>
      </div>
    </div>
  );
};

export default LandingPageHowItWorks;
