import Stepper from "./components/Stepper";
import { useContestSteps } from "./hooks/useContestSteps";

const CreateFlow = () => {
  const { steps } = useContestSteps();

  return (
    <div className="pl-4 pr-4 lg:pl-12">
      <Stepper steps={steps} />
    </div>
  );
};

export default CreateFlow;
