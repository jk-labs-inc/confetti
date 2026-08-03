import MotionSpinner from "@components/UI/MotionSpinner";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { TransactionOverlayStep } from "../../types";

interface StepListProps {
  steps: TransactionOverlayStep[];
}

const StepList: FC<StepListProps> = ({ steps }) => (
  <div className="flex flex-col items-start gap-2">
    {steps.map((step, index) => (
      <div key={index} className="flex items-center gap-3">
        <div className="flex w-5 items-center justify-center">
          {step.status === "completed" ? (
            <CheckCircleIcon className="h-5 w-5 text-positive-11" />
          ) : step.status === "active" ? (
            <MotionSpinner theme="light" size={16} />
          ) : (
            <span className="h-[6px] w-[6px] rounded-full bg-neutral-10" />
          )}
        </div>
        <p
          className={`text-[14px] font-bold ${
            step.status === "completed"
              ? "text-positive-11"
              : step.status === "active"
                ? "animate-flicker text-neutral-11"
                : "text-neutral-10"
          }`}
        >
          {step.label}
        </p>
      </div>
    ))}
  </div>
);

export default StepList;
