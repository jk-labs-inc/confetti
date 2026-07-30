import CreateSeedRewardsToggle from "@components/_pages/Create/components/SeedRewardsToggle";
import { ChainWithIcon } from "@config/wagmi";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useWallet } from "@hooks/useWallet";
import { useShallow } from "zustand/shallow";
import TokenWidgets from "./components/TokenWidgets";

const CreateRewardsFundPool = () => {
  const { chain } = useWallet();
  const addFundsToRewards = useDeployContestStore(useShallow(state => state.addFundsToRewards));

  return (
    <div className="flex flex-col gap-8">
      <CreateSeedRewardsToggle />

      {addFundsToRewards ? (
        <div className="flex flex-col gap-8">
          <TokenWidgets chain={chain as ChainWithIcon} />
        </div>
      ) : null}
    </div>
  );
};

export default CreateRewardsFundPool;
