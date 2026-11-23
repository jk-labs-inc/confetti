import { hasDescription } from "@components/_pages/Contest/components/Prompt/utils";
import { useContestStore } from "@hooks/useContest/store";
import { ReactNode, useId, useState } from "react";
import DescriptionPanel from "../components/DescriptionPanel";
import DescriptionToggle from "../components/DescriptionToggle";

interface DescriptionDisclosure {
  toggle: ReactNode;
  panel: ReactNode;
}

export const useDescriptionDisclosure = (showToggle: boolean, prompt: string): DescriptionDisclosure => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const isV3 = useContestStore(state => state.isV3);
  const hasContent = isV3 ? hasDescription(prompt) : !!prompt;

  if (!showToggle || !hasContent) return { toggle: null, panel: null };

  return {
    toggle: <DescriptionToggle isOpen={isOpen} panelId={panelId} onToggle={() => setIsOpen(prev => !prev)} />,
    panel: <DescriptionPanel id={panelId} isOpen={isOpen} prompt={prompt} />,
  };
};

export default useDescriptionDisclosure;
