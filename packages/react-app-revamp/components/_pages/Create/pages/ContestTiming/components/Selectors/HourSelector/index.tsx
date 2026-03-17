import { Option } from "@components/UI/Dropdown";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import MobileHourSelector from "./Mobile";
import Dropdown from "@components/UI/Dropdown";

interface CreateContestTimingHourSelectorProps {
  hours: Option[];
  defaultValue: string;
  onChange?: (hour: string) => void;
}

const CreateContestTimingHourSelector: FC<CreateContestTimingHourSelectorProps> = ({
  hours,
  onChange,
  defaultValue,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  if (isMobile) {
    return <MobileHourSelector hours={hours} defaultValue={defaultValue} onChange={onChange} />;
  }

  return (
    <div className="flex items-center gap-4">
      <Dropdown
        options={hours}
        menuButtonWidth="w-[160px]"
        menuItemsWidth="w-[160px]"
        onChange={onChange}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export default CreateContestTimingHourSelector;
