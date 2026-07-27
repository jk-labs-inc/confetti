import CreateTextContainer from "../../components/TextContainer";
import CreateRewardsPool from "./components/CreatePool";

const CreateContestRewardsSection = () => {
  return (
    <div className="flex flex-col gap-8">
      <CreateTextContainer>
        <p>
          the rewards pool will <b>self-fund.</b> as voters buy votes, 90% of their funds will go into the pool.
        </p>
        <p className="font-bold">voters on winners can claim their share of rewards.</p>
        <p>we recommend adding rewards for multiple ranks if the contest will likely get more than 3 entries.</p>
      </CreateTextContainer>
      <CreateRewardsPool />
    </div>
  );
};

export default CreateContestRewardsSection;
