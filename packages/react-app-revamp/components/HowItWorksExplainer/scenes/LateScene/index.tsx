import TypingVoteScene from "@components/HowItWorksExplainer/scenes/TypingVoteScene";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { FC } from "react";

const LateScene: FC<SceneProps> = ({ script }) => <TypingVoteScene script={script} scenarioId="late" />;

export default LateScene;
