import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useShallow } from "zustand/shallow";
import CreateSwitch from "../Switch";

const CreateSeedRewardsToggle = () => {
  const { addFundsToRewards, setAddFundsToRewards } = useDeployContestStore(
    useShallow(state => ({
      addFundsToRewards: state.addFundsToRewards,
      setAddFundsToRewards: state.setAddFundsToRewards,
    })),
  );

  return (
    <div className="flex items-center gap-4">
      <CreateSwitch checked={addFundsToRewards} onChange={setAddFundsToRewards} />
      <p className="text-[16px] text-neutral-11">
        i'll seed rewards <span className="text-[12px] text-neutral-9">(recommended: ~$100)</span>
      </p>
    </div>
  );
};

export default CreateSeedRewardsToggle;
