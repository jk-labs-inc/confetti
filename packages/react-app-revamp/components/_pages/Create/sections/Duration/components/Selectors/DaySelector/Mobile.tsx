import { FC } from "react";
import MobileSelector from "../MobileSelector";
import { Option } from "@components/UI/Dropdown";

interface MobileDaySelectorProps {
  days: Option[];
  defaultValue: string;
  onChange?: (day: string) => void;
}

const MobileDaySelector: FC<MobileDaySelectorProps> = ({ days, onChange, defaultValue }) => {
  return (
    <MobileSelector
      label="Select Day"
      value={defaultValue}
      options={days}
      onChange={onChange || (() => {})}
      className="w-[80px] shrink-0"
    />
  );
};

export default MobileDaySelector;
