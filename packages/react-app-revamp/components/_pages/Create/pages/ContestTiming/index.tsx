import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMediaQuery } from "react-responsive";
import moment from "moment-timezone";
import { useEffect } from "react";
import CreateNextButton from "../../components/Buttons/Next";
import MobileStepper from "../../components/MobileStepper";
import StepCircle from "../../components/StepCircle";
import { useContestSteps } from "../../hooks/useContestSteps";
import { useNextStep } from "../../hooks/useNextStep";
import CreateContestTimingVotingOpens from "./components/VotingOpens";
import CreateContestTimingDuration from "./components/VotingCloses";
import { useShallow } from "zustand/shallow";
import { StepTitle, getStepNumber } from "../../types";
import CreateTextContainer from "../../components/TextContainer";

const CreateContestTiming = () => {
  const { steps } = useContestSteps();
  const { step, errors, votingOpen, validateTiming, setError } = useDeployContestStore(
    useShallow(state => ({
      step: state.step,
      errors: state.errors,
      votingOpen: state.votingOpen,
      validateTiming: state.validateTiming,
      setError: state.setError,
    })),
  );
  const onNextStep = useNextStep();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const contestTitle = isMobile ? "how long is voting?" : "how long does voting run?";
  const currentError = errors.find(error => error.step === getStepNumber(StepTitle.Timing));

  useEffect(() => {
    const validation = validateTiming();
    if (!validation.isValid) {
      setError(StepTitle.Timing, {
        step: getStepNumber(StepTitle.Timing),
        message: validation.error || "Invalid timing",
      });
    } else {
      setError(StepTitle.Timing, { step: getStepNumber(StepTitle.Timing), message: "" });
    }
  }, [votingOpen, validateTiming, setError]);

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
              <p>entries can be submitted anytime before voting opens.</p>
              {isMobile ? (
                <p>
                  <b>we recommend two hours to vote</b> so anyone can participate actively, as in a sports game.
                </p>
              ) : (
                <div>
                  <p>recommendations (set by default):</p>
                  <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
                    <li>
                      <b>set voting to open at least one week from now,</b> so there&apos;s time to market the
                      contest.
                    </li>
                    <li>
                      <b>set voting to run two hours</b> so players can participate throughout, as in a sports game.
                    </li>
                  </ul>
                </div>
              )}
            </CreateTextContainer>
            <div className="flex flex-col gap-8">
              <CreateContestTimingVotingOpens />
              <CreateContestTimingDuration />
              <div className="pl-6 text-[20px] text-neutral-9">
                <p>time zone: {moment.tz.guess()}</p>
              </div>
            </div>
            <div className="hidden md:block mt-4 pl-6">
              <CreateNextButton
                id="create_flow_timing_next"
                step={step + 1}
                onClick={() => onNextStep()}
                isDisabled={!!currentError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContestTiming;
