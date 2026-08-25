import { FC } from "react";
import {
  TransactionOverlayFlow,
  TransactionOverlayPhase,
  TransactionOverlayPlacement,
  TransactionOverlayStep,
  TransactionOverlaySuccessMeta,
} from "../../types";
import AmbientParticles from "../AmbientParticles";
import ErrorView from "../ErrorView";
import PendingView from "../PendingView";
import SuccessView from "../SuccessView";

interface OverlaySceneProps {
  flow: TransactionOverlayFlow;
  phase: TransactionOverlayPhase;
  errorMessage: string;
  steps: TransactionOverlayStep[];
  successMeta: TransactionOverlaySuccessMeta | null;
  placement: TransactionOverlayPlacement;
  contentClassName?: string;
}

const OverlayScene: FC<OverlaySceneProps> = ({
  flow,
  phase,
  errorMessage,
  steps,
  successMeta,
  placement,
  contentClassName = "",
}) => (
  <>
    <div
      className="absolute inset-0 bg-[radial-gradient(55%_40%_at_50%_42%,#16101b_0%,#000000_100%)]"
      aria-hidden="true"
    />
    {phase !== TransactionOverlayPhase.ERROR && <AmbientParticles />}
    <div className={`relative flex flex-1 flex-col items-center justify-center ${contentClassName}`}>
      {phase === TransactionOverlayPhase.ERROR ? (
        <ErrorView errorMessage={errorMessage} />
      ) : phase === TransactionOverlayPhase.SUCCESS ? (
        <SuccessView flow={flow} meta={successMeta} placement={placement} />
      ) : (
        <PendingView flow={flow} phase={phase} steps={steps} placement={placement} />
      )}
    </div>
  </>
);

export default OverlayScene;
