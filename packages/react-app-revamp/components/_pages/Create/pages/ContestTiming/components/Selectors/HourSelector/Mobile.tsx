import { FC } from "react";
import MobileSelector from "../MobileSelector";
import { Option } from "@components/UI/Dropdown";

interface MobileHourSelectorProps {
  hours: Option[];
  defaultValue: string;
  onChange?: (hour: string) => void;
}

const MobileHourSelector: FC<MobileHourSelectorProps> = ({ hours, onChange, defaultValue }) => {
  return (
    <MobileSelector
      label="Select Hour"
      value={defaultValue}
      options={hours}
      onChange={onChange || (() => {})}
      width="w-[160px]"
    />
  );
};

export default MobileHourSelector;
