import { FC } from "react";
import MobileSelector from "../MobileSelector";
import { Option } from "@components/UI/Dropdown";

interface MobileMonthSelectorProps {
  months: Option[];
  defaultValue: string;
  onChange?: (month: string) => void;
}

const MobileMonthSelector: FC<MobileMonthSelectorProps> = ({ months, onChange, defaultValue }) => {
  return (
    <MobileSelector
      label="Select Month"
      value={defaultValue}
      // every english month abbreviates to its first three letters, so the trigger fits alongside day and hour
      displayValue={defaultValue.slice(0, 3)}
      options={months}
      onChange={onChange || (() => {})}
      className="grow basis-[92px] min-w-0"
    />
  );
};

export default MobileMonthSelector;
