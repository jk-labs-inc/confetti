import { FC } from "react";
import MobileDaySelector from "./Mobile";
import { useMediaQuery } from "react-responsive";
import { Option } from "@components/UI/Dropdown";
import Dropdown from "@components/UI/Dropdown";

interface CreateContestTimingDaySelectorProps {
  days: Option[];
  defaultValue: string;
  onChange?: (day: string) => void;
}

const CreateContestTimingDaySelector: FC<CreateContestTimingDaySelectorProps> = ({ days, onChange, defaultValue }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  if (isMobile) {
    return <MobileDaySelector days={days} defaultValue={defaultValue} onChange={onChange} />;
  }
  return (
    <Dropdown
      options={days}
      menuButtonWidth="w-24"
      menuItemsWidth="w-24"
      menuButtonTextColor="text-neutral-9"
      onChange={onChange}
      defaultValue={defaultValue}
    />
  );
};

export default CreateContestTimingDaySelector;
