import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface LoadAllButtonProps {
  onClick: () => void;
  isEnded?: boolean;
}

const LoadAllButton: FC<LoadAllButtonProps> = ({ onClick, isEnded }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 h-5 text-xs font-bold cursor-pointer hover:brightness-110 text-positive-11 ${
        isEnded ? "opacity-60" : ""
      }`}
    >
      load all <ChevronDownIcon className="w-3 h-3" />
    </button>
  );
};

export default LoadAllButton;
