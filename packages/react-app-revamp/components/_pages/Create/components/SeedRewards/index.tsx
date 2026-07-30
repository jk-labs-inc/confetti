import { ChainWithIcon } from "@config/wagmi";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useWallet } from "@hooks/useWallet";
import { AnimatePresence, motion } from "motion/react";
import { FC, useState } from "react";
import { useShallow } from "zustand/shallow";
import { SEED_REWARDS_BLOCK_ID } from "../../hooks/useSectionNavigation";
import TokenWidgets from "../../sections/Rewards/components/FundPool/components/TokenWidgets";
import CreateSeedRewardsToggle from "../SeedRewardsToggle";

interface CreateSeedRewardsProps {
  errorMessage?: string | null;
}

const CreateSeedRewards: FC<CreateSeedRewardsProps> = ({ errorMessage }) => {
  const { chain } = useWallet();
  const addFundsToRewards = useDeployContestStore(useShallow(state => state.addFundsToRewards));
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div id={SEED_REWARDS_BLOCK_ID} className="flex flex-col gap-4 scroll-mt-20">
      <CreateSeedRewardsToggle />

      <AnimatePresence initial={false}>
        {addFundsToRewards ? (
          <motion.div
            key="seed-rewards-amount"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
            className={isAnimating ? "overflow-hidden" : "overflow-visible"}
          >
            <TokenWidgets chain={chain as ChainWithIcon} preferredInputMode="usd" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {errorMessage ? <p className="text-[12px] md:text-[16px] font-bold text-negative-11">{errorMessage}</p> : null}
    </div>
  );
};

export default CreateSeedRewards;
