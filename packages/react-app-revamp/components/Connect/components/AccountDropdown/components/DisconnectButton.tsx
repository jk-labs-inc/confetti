import { MenuItem } from "@headlessui/react";
import { PowerIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface DisconnectButtonProps {
  onDisconnect: () => void;
}

const DisconnectButton: FC<DisconnectButtonProps> = ({ onDisconnect }) => {
  return (
    <div className="border-t border-neutral-17 p-2">
      <MenuItem>
        <button
          onClick={onDisconnect}
          className="flex flex-col gap-2 w-full items-center justify-center text-[16px] font-bold uppercase px-4 py-3 rounded-lg data-focus:bg-white/10 hover:bg-white/10 transition-colors"
        >
          <PowerIcon width={32} height={32} className="text-negative-11" />
          <p className="text-base font-bold text-neutral-11">sign out</p>
        </button>
      </MenuItem>
    </div>
  );
};

export default DisconnectButton;
