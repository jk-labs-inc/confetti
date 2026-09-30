import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface DescriptionToggleProps {
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
}

const DescriptionToggle: FC<DescriptionToggleProps> = ({ isOpen, panelId, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={isOpen}
    aria-controls={panelId}
    aria-label={isOpen ? "hide contest description" : "show contest description"}
    className="shrink-0 self-center -ml-1 flex items-center justify-center w-7 h-7 rounded-full text-neutral-9 hover:text-neutral-11 hover:bg-white/8 transition-colors duration-150"
  >
    <ChevronDownIcon
      strokeWidth={2.5}
      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
    />
  </button>
);

export default DescriptionToggle;
