import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import CreateNextButton from "../../components/Buttons/Next";
import MobileStepper from "../../components/MobileStepper";
import StepCircle from "../../components/StepCircle";
import CreateTextContainer from "../../components/TextContainer";
import { useContestSteps } from "../../hooks/useContestSteps";
import { useNextStep } from "../../hooks/useNextStep";
import CreateRewardsPool from "./components/CreatePool";
import CreateRewardsFundPool from "./components/FundPool";
import { useFundPoolStore } from "./components/FundPool/store";

const CreateContestRewards = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { steps } = useContestSteps();
  const step = useDeployContestStore(useShallow(state => state.step));
  const contestTitle = isMobile ? "add voter rewards" : "add rewards for voters";
  const onNextStep = useNextStep();
  const { validateRewards, rewardPoolData, setRewardPoolData } = useDeployContestStore(
    useShallow(state => ({
      validateRewards: state.validateRewards,
      rewardPoolData: state.rewardPoolData,
      setRewardPoolData: state.setRewardPoolData,
    })),
  );
  const { isError: isTokenWidgetError } = useFundPoolStore(useShallow(state => state));
  const isDisabled = !validateRewards().isValid || isTokenWidgetError;

  const handleNextStep = () => {
    const validRecipients = rewardPoolData.recipients.filter(
      recipient => recipient.proportion !== null && recipient.proportion > 0,
    );

    setRewardPoolData(prev => ({
      ...prev,
      recipients: validRecipients,
    }));

    onNextStep();
  };

  return (
    <div className="flex flex-col">
      <MobileStepper currentStep={step} totalSteps={steps.length} />
      <div className="grid grid-cols-(--grid-full-width-create-flow) mt-12 lg:mt-[70px] animate-appear">
        <div className="col-span-1">
          <StepCircle step={step + 1} />
        </div>
        <div className="col-span-2 ml-10 md:pl-6">
          <p className="text-[24px] font-bold text-neutral-11">{contestTitle}</p>
        </div>
        <div className="grid col-start-1 md:col-start-2 col-span-2 md:ml-10 mt-8 md:mt-10">
          <div className="flex flex-col gap-12">
            <CreateTextContainer>
              <p>
                the rewards pool will <b>self-fund.</b> as voters buy votes, 90% {isMobile ? "" : <br />}
                of their funds will go into the pool.{isMobile ? "" : <br />}
              </p>
              <p className="font-bold">voters on winners can claim their share of rewards.</p>
              <p>we recommend adding rewards for multiple ranks if the contest will likely get more than 3 entries.</p>
            </CreateTextContainer>
            <div className="flex flex-col gap-8 md:pl-6">
              <CreateRewardsPool />
              <CreateRewardsFundPool />
            </div>
            <div className="hidden md:block mt-4 pl-6">
              <CreateNextButton
                id="create_flow_rewards_next"
                step={step + 1}
                onClick={handleNextStep}
                isDisabled={isDisabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContestRewards;
