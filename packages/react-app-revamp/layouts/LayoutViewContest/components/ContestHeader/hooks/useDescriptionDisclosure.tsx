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

  if (!showToggle || !prompt) return { toggle: null, panel: null };

  return {
    toggle: <DescriptionToggle isOpen={isOpen} panelId={panelId} onToggle={() => setIsOpen(prev => !prev)} />,
    panel: <DescriptionPanel id={panelId} isOpen={isOpen} prompt={prompt} />,
  };
};

export default useDescriptionDisclosure;
