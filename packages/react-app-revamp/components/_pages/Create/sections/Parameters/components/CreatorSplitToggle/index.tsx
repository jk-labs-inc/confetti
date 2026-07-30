import CreateSwitch from "@components/_pages/Create/components/Switch";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useShallow } from "zustand/shallow";
import CreatorSplitToggleInfo from "./components/CreatorSplitToggleInfo";

const CreateContestCreatorSplitToggle = () => {
  const { creatorSplitEnabled, setCreatorSplitEnabled } = useDeployContestStore(
    useShallow(state => ({
      creatorSplitEnabled: state.charge.creatorSplitEnabled,
      setCreatorSplitEnabled: state.setCharge,
    })),
  );

  const handleCreatorSplitEnabled = () => {
    setCreatorSplitEnabled(charge => ({
      ...charge,
      creatorSplitEnabled: charge.creatorSplitEnabled === 1 ? 0 : 1,
    }));
  };

  return (
    <div className="flex items-center gap-6">
      <CreateSwitch checked={creatorSplitEnabled === 1} onChange={handleCreatorSplitEnabled} />
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <p className="text-base text-neutral-11">
            collect creator fees<span className="hidden md:inline"> (5% of all voting charges)</span>
          </p>
          <p className="text-xs text-neutral-9 md:hidden">5% of voting charges</p>
        </div>
        <CreatorSplitToggleInfo />
      </div>
    </div>
  );
};

export default CreateContestCreatorSplitToggle;
