import CreateNextButton from "@components/_pages/Create/components/Buttons/Next";
import MobileStepper from "@components/_pages/Create/components/MobileStepper";
import StepCircle from "@components/_pages/Create/components/StepCircle";
import { useContestSteps } from "@components/_pages/Create/hooks/useContestSteps";
import { useNextStep } from "@components/_pages/Create/hooks/useNextStep";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMediaQuery } from "react-responsive";
import CreateContestRulesDescription from "./Description";
import CreateContestRulesTitleAndImage from "./TitleAndImage";

export const VOTING_STEP = 6;

const CreateContestRules = () => {
  const { steps } = useContestSteps();
  const { step, title, prompt } = useDeployContestStore(state => state);
  const onNextStep = useNextStep();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const customizeTitle = isMobile ? "setting the rules" : "finally, let’s set the rules";
  const isDisabled = !title || !prompt.summarize || !prompt.evaluateVoters;

  return (
    <div className="flex flex-col">
      <MobileStepper currentStep={step} totalSteps={steps.length} />
      <div className="grid grid-cols-(--grid-full-width-create-flow) mt-12 lg:mt-[70px] animate-appear">
        <div className="col-span-1">
          <StepCircle step={step + 1} />
        </div>
        <div className="col-span-2 ml-10">
          <p className="text-[24px] text-neutral-11 font-bold">{customizeTitle}</p>
        </div>
        <div className="grid gap-8 col-start-1 md:col-start-2 col-span-2 md:ml-10 mt-8 md:mt-6">
          <CreateContestRulesTitleAndImage />
          <CreateContestRulesDescription />
          <div className="hidden md:block mt-8">
            <CreateNextButton
              id="create_flow_rules_next"
              step={step + 1}
              onClick={() => onNextStep()}
              isDisabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContestRules;
