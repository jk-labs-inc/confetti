import Dropdown, { Option } from "@components/UI/Dropdown";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import MobileMonthSelector from "./Mobile";

interface CreateContestTimingMonthSelectorProps {
  months: Option[];
  defaultValue: string;
  onChange?: (month: string) => void;
}

const CreateContestTimingMonthSelector: FC<CreateContestTimingMonthSelectorProps> = ({
  months,
  onChange,
  defaultValue,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  if (isMobile) {
    return <MobileMonthSelector months={months} defaultValue={defaultValue} onChange={onChange} />;
  }
  return (
    <Dropdown
      options={months}
      menuButtonWidth="w-[168px]"
      menuItemsWidth="w-[168px]"
      menuButtonTextColor="text-neutral-9"
      onChange={onChange}
      defaultValue={defaultValue}
    />
  );
};

export default CreateContestTimingMonthSelector;
