import { FC } from "react";
import { PreviewDevice } from "./types";

const DEVICES: PreviewDevice[] = ["desktop", "mobile"];

interface DeviceTabsProps {
  value: PreviewDevice;
  onChange: (device: PreviewDevice) => void;
}

const DeviceTabs: FC<DeviceTabsProps> = ({ value, onChange }) => (
  <div role="tablist" aria-label="entry preview device" className="flex gap-1 rounded-full bg-true-black p-0.5">
    {DEVICES.map(device => (
      <button
        key={device}
        type="button"
        role="tab"
        aria-selected={device === value}
        onClick={() => onChange(device)}
        className={`h-6 flex-1 cursor-pointer rounded-full px-3 text-[12px] font-bold leading-none transition-colors duration-150 ease-out ${
          device === value ? "bg-white/15 text-neutral-11" : "text-neutral-9 hover:text-neutral-11"
        }`}
      >
        {device}
      </button>
    ))}
  </div>
);

export default DeviceTabs;
