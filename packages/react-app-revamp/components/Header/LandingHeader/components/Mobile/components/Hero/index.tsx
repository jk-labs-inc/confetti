import CustomLink from "@components/UI/Link";
import Logo from "@components/UI/Logo";
import { ROUTE_HOW_IT_WORKS } from "@config/routes";
import { motion, useReducedMotion, Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
      mass: 0.8,
    },
  },
};

const LandingHeaderMobileHero = () => {
  const shouldReduceMotion = useReducedMotion();

  // 264px = ticker (48) + fixed bottom nav (~110) + featured-contests label/margins (~61) + ~45px card
  // sneak-peek; svh keeps the peek visible even with iOS browser chrome expanded
  return (
    <motion.section
      className="flex h-[calc(100svh-264px)] min-h-[280px] flex-col items-center justify-center px-8 pt-7 short:pt-4"
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={containerVariants}
    >
      <h1 className="flex flex-col gap-6 text-center text-2xl text-neutral-11 short:gap-4 short:text-xl">
        <motion.span variants={itemVariants}>
          earn for <span className="inline-block font-bold">your beliefs.</span>
        </motion.span>
        <motion.span variants={itemVariants}>
          earn more for <span className="block font-bold text-positive-18">your conviction.</span>
        </motion.span>
      </h1>

      <motion.div variants={logoVariants} className="mt-12 w-full max-w-[260px] short:mt-6 short:max-w-[210px]">
        <Logo width={260} height={50} className="w-full" fetchPriority="high" />
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-4 short:mt-4">
        <motion.div variants={itemVariants}>
          <CustomLink
            prefetch={false}
            href="#featured-contests"
            className="flex h-10 w-[210px] items-center justify-center rounded-2xl bg-positive-18 text-base text-true-black"
          >
            play in contests and earn
          </CustomLink>
        </motion.div>
        <motion.div variants={itemVariants}>
          <CustomLink href={ROUTE_HOW_IT_WORKS} className="block py-1 text-base text-positive-9">
            or learn how it works
          </CustomLink>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LandingHeaderMobileHero;
