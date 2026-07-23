import { FC, useEffect, useState } from "react";

interface CreateFlowMonetizationInputProps {
  value: number;
  errorMessage?: string;
  onChange?: (value: number) => void;
}

const CreateFlowMonetizationInput: FC<CreateFlowMonetizationInputProps> = ({ value, errorMessage, onChange }) => {
  const [inputValue, setInputValue] = useState(value > 0 ? value.toString() : "");
  const [width, setWidth] = useState(2);

  useEffect(() => {
    if (!inputValue) {
      setWidth(2);
      return;
    }

    const dotCount = (inputValue.match(/\./g) || []).length;
    const adjustedWidth = inputValue.length - dotCount * 0.5;
    setWidth(adjustedWidth || 2);
  }, [inputValue]);

  const handleInput = (e: React.InputEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const cleanedValue = target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");

    setInputValue(cleanedValue);

    const numericValue = cleanedValue === "" || cleanedValue === "." ? 0 : Number(cleanedValue);
    onChange?.(numericValue);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onInput={handleInput}
          placeholder="10"
          style={{ width: `${width}ch` }}
          className="bg-transparent box-content font-bold border-b outline-none text-neutral-11 text-[40px]"
        />
        <span className="text-neutral-10 text-[40px] font-bold">x</span>
      </div>
      {errorMessage && <p className="text-negative-11 text-[14px] font-bold animate-fade-in">{errorMessage}</p>}
    </div>
  );
};

export default CreateFlowMonetizationInput;
