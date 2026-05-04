import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FC, useState } from "react";
import { MAX_TITLE_LENGTH } from "../../constants";

interface DialogModalSendProposalEntryPreviewTitleLayoutProps {
  onChange?: (value: string) => void;
}

const DialogModalSendProposalEntryPreviewTitleLayout: FC<DialogModalSendProposalEntryPreviewTitleLayoutProps> = ({
  onChange,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange?.(value.slice(0, MAX_TITLE_LENGTH));
  };

  return (
    <div className="flex flex-col gap-4">
      <CreateGradientTitle textSize="small">title</CreateGradientTitle>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="w-full text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 placeholder-neutral-10 h-12 indent-4 focus:outline-none"
        placeholder="this is my entry..."
        maxLength={MAX_TITLE_LENGTH}
      />
      <p className="text-[16px] text-[#6A6A6A] ml-4">
        {inputValue.length}/{MAX_TITLE_LENGTH} characters
      </p>
    </div>
  );
};

export default DialogModalSendProposalEntryPreviewTitleLayout;
