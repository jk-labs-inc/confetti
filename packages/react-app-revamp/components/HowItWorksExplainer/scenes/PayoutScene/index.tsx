import TypingVoteScene from "@components/HowItWorksExplainer/scenes/TypingVoteScene";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { FC } from "react";

const PayoutScene: FC<SceneProps> = ({ script }) => <TypingVoteScene script={script} scenarioId="payout" />;

export default PayoutScene;
