import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import Dropdown from "@components/UI/Dropdown";
import MobileSelector from "../Selectors/MobileSelector";

const CreateContestTimingDuration = () => {
  const { votingDuration, setVotingDuration, getDurationOptions } = useDeployContestStore(
    useShallow(state => ({
      votingDuration: state.votingDuration,
      setVotingDuration: state.setVotingDuration,
      getDurationOptions: state.getDurationOptions,
    })),
  );

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const durationOptions = getDurationOptions();
  const durationLabel = votingDuration === 1 ? "1 hour" : `${votingDuration} hours`;

  const handleDurationChange = (value: string) => {
    setVotingDuration(parseInt(value));
  };

  return (
    <div className="flex flex-col gap-4 pl-6">
      <p className="text-base font-bold text-neutral-9 uppercase">duration</p>
      <div className="flex flex-wrap items-center gap-4">
        {isMobile ? (
          <MobileSelector
            label="Select Duration"
            value={durationLabel}
            options={durationOptions}
            onChange={handleDurationChange}
            width="w-[160px]"
          />
        ) : (
          <Dropdown
            options={durationOptions}
            menuButtonWidth="w-[160px]"
            menuItemsWidth="w-[160px]"
            onChange={handleDurationChange}
            defaultValue={durationLabel}
          />
        )}
      </div>
    </div>
  );
};

export default CreateContestTimingDuration;
