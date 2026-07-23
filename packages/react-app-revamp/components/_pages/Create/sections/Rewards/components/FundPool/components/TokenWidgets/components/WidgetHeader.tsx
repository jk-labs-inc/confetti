/* eslint-disable @next/next/no-img-element */
import { TrashIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface WidgetHeaderProps {
  index: number;
  chainLogo: string;
  onRemove: () => void;
}

const WidgetHeader: FC<WidgetHeaderProps> = ({ index, chainLogo, onRemove }) => {
  return (
    <div className={`flex flex-row ${index > 0 ? "justify-between" : "justify-end"}`}>
      {index > 0 ? (
        <button onClick={onRemove} aria-label="Remove token">
          <TrashIcon className="w-5 h-5 text-negative-11 hover:text-negative-10 transition-colors duration-300 ease-in-out" />
        </button>
      ) : null}
      <div className="flex justify-end">
        <img src={chainLogo} alt="chain-logo" width={20} height={20} className="rounded-full" />
      </div>
    </div>
  );
};

export default WidgetHeader;
