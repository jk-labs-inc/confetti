import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import CreateSwitch from "../Switch";

interface CreateSeedRewardsToggleProps {
  onCheckedChange?: (checked: boolean) => void;
}

const CreateSeedRewardsToggle: FC<CreateSeedRewardsToggleProps> = ({ onCheckedChange }) => {
  const { addFundsToRewards, setAddFundsToRewards } = useDeployContestStore(
    useShallow(state => ({
      addFundsToRewards: state.addFundsToRewards,
      setAddFundsToRewards: state.setAddFundsToRewards,
    })),
  );

  const handleChange = (checked: boolean) => {
    setAddFundsToRewards(checked);
    onCheckedChange?.(checked);
  };

  return (
    <div className="flex items-center gap-4">
      <CreateSwitch checked={addFundsToRewards} onChange={handleChange} />
      <p className="text-[16px] text-neutral-11">
        i'll seed rewards <span className="text-[12px] text-neutral-9">(recommended: ~$100)</span>
      </p>
    </div>
  );
};

export default CreateSeedRewardsToggle;
