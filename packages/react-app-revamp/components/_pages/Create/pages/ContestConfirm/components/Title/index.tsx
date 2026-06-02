import CreateTextInput from "@components/_pages/Create/components/TextInput";
import { CONTEST_TITLE_MAX_LENGTH, CONTEST_TITLE_MIN_LENGTH } from "@components/_pages/Create/constants/length";
import { FC } from "react";
import CreateContestConfirmLayout from "../Layout";

interface CreateContestConfirmTitleProps {
  title: string;
  step: number;
  onClick?: (stepIndex: number) => void;
  onTitleChange?: (value: string) => void;
}

const CreateContestConfirmTitle: FC<CreateContestConfirmTitleProps> = ({ step, title, onClick, onTitleChange }) => {
  return (
    <CreateContestConfirmLayout onClick={() => onClick?.(step)}>
      <div className="flex flex-col gap-2">
        <p className="text-neutral-9 text-[12px] font-bold uppercase">title</p>
        <CreateTextInput
          className="w-full md:w-[640px]"
          value={title}
          placeholder="eg. gitcoin bounty for devs"
          minLength={CONTEST_TITLE_MIN_LENGTH}
          maxLength={CONTEST_TITLE_MAX_LENGTH}
          onChange={value => onTitleChange?.(value)}
        />
      </div>
    </CreateContestConfirmLayout>
  );
};

export default CreateContestConfirmTitle;
