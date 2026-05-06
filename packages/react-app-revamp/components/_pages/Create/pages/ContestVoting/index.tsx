import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMemo, useState } from "react";
import { useWallet } from "@hooks/useWallet";
import CreateNextButton from "../../components/Buttons/Next";
import CreateConnectPrompt from "../../components/ConnectPrompt";
import MobileStepper from "../../components/MobileStepper";
import StepCircle from "../../components/StepCircle";
import { useContestSteps } from "../../hooks/useContestSteps";
import { useNextStep } from "../../hooks/useNextStep";
import CreateContestPriceCurve from "./components/PriceCurve";

const CreateContestVoting = () => {
  const { step } = useDeployContestStore(state => state);
  const { steps } = useContestSteps();
  const { isConnected, chain } = useWallet();
  const [disableNextStep, setDisableNextStep] = useState(false);
  const onNextStep = useNextStep();

  const switchLayout = useMemo<React.JSX.Element>(() => {
    if (!isConnected) {
      setDisableNextStep(true);
      return <CreateConnectPrompt />;
    }

    setDisableNextStep(false);

    return (
      <CreateContestPriceCurve
        chain={chain?.name.toLowerCase() ?? ""}
        onError={hasError => {
          setDisableNextStep(hasError);
        }}
      />
    );
  }, [isConnected, chain?.name]);

  return (
    <div className="flex flex-col">
      <MobileStepper currentStep={step} totalSteps={steps.length} />
      <div className="grid grid-cols-(--grid-full-width-create-flow) mt-12 lg:mt-[70px] animate-appear">
        <div className="col-span-1">
          <StepCircle step={step + 1} />
        </div>
        <div className="col-span-2 ml-10 md:pl-6">
          <p className="text-[24px] text-neutral-11 font-bold">voting</p>
        </div>
        <div className="grid col-start-1 md:col-start-2 col-span-2  md:ml-10 mt-8 md:mt-10">
          {switchLayout}
          {isConnected && (
            <div className="hidden md:block mt-16 pl-6">
              <CreateNextButton
                id="create_flow_voting_next"
                step={step + 1}
                isDisabled={disableNextStep}
                onClick={() => onNextStep()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateContestVoting;
