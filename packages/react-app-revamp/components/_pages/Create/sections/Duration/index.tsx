import moment from "moment-timezone";
import CreateContestTimingDuration from "./components/DurationSelector";
import CreateContestTimingVotingOpens from "./components/VotingOpens";

const TIME_ZONE_CITY = moment.tz.guess().split("/").pop()?.replace(/_/g, " ");

const CreateContestDurationSection = () => {
  return (
    <div className="flex flex-col gap-8">
      <CreateContestTimingVotingOpens />
      <CreateContestTimingDuration />
      <p className="text-[16px] text-neutral-9">time zone: {TIME_ZONE_CITY}</p>
    </div>
  );
};

export default CreateContestDurationSection;
