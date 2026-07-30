import { FC, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface CreateTextInputProps {
  value?: string;
  placeholder?: string;
  errorMessage?: string;
  max?: number;
  min?: number;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onClick?: () => void;
}

const CreateTextInput: FC<CreateTextInputProps> = ({
  value,
  placeholder,
  max,
  min,
  minLength = 100,
  maxLength = 100,
  readOnly = false,
  className,
  onChange,
  onClick,
}) => {
  const inputRef = useRef(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    onChange?.(newValue);
  };

  return (
    <input
      ref={inputRef}
      value={value}
      type="text"
      onClick={onClick}
      className={`w-full md:w-[600px] text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 h-12 indent-4 focus:outline-none ${className}`}
      placeholder={placeholder}
      readOnly={readOnly}
      min={min}
      max={max}
      maxLength={maxLength}
      minLength={minLength}
      onChange={handleChange}
    />
  );
};

export default CreateTextInput;
