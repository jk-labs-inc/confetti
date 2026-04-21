import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMediaQuery } from "react-responsive";
import CreateNextButton from "../../components/Buttons/Next";
import MobileStepper from "../../components/MobileStepper";
import StepCircle from "../../components/StepCircle";
import { useContestSteps } from "../../hooks/useContestSteps";
import { useNextStep } from "../../hooks/useNextStep";
import CreateContestEntriesEntrySettings from "./components/EntrySettings";
import CreateContestEntriesPreviewPicker from "./components/PreviewPicker";
import CreateTextContainer from "../../components/TextContainer";

const CreateContestEntries = () => {
  const { steps } = useContestSteps();
  const { step } = useDeployContestStore(state => state);
  const onNextStep = useNextStep();
  const stepTitle = "entries";

  return (
    <div className="flex flex-col">
      <MobileStepper currentStep={step} totalSteps={steps.length} />
      <div className="grid grid-cols-(--grid-full-width-create-flow) mt-12 lg:mt-[70px] animate-appear">
        <div className="col-span-1">
          <StepCircle step={step + 1} />
        </div>
        <div className="col-span-2 ml-10">
          <p className="text-[24px] text-neutral-11 font-bold pl-6">{stepTitle}</p>
        </div>

        <div className="grid gap-12 col-start-1 md:col-start-2 col-span-3 md:col-span-2 md:ml-10 mt-8 md:mt-10">
          <CreateTextContainer>
            <p>entries are what voters buy votes on. you can</p>
            <ul className="list-disc pl-6">
              <li>submit entries to contest anytime before voting opens</li>
              <li>add additional info to an entry if you like</li>
            </ul>
          </CreateTextContainer>
          <CreateContestEntriesPreviewPicker />
          <CreateContestEntriesEntrySettings />

          <div className="hidden md:block mt-4 pl-6">
            <CreateNextButton id="create_flow_entries_next" step={step + 1} onClick={() => onNextStep()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContestEntries;
