import { NumericKeypadKey } from "@components/UI/NumericKeypad";

const MAX_INPUT_LENGTH = 12;

interface UseKeypadInputProps {
  displayValue: string;
  onDisplayChange: (value: string) => void;
}

const useKeypadInput = ({ displayValue, onDisplayChange }: UseKeypadInputProps) => {
  const handleKey = (key: NumericKeypadKey) => {
    if (key === "backspace") {
      if (!displayValue) return;
      onDisplayChange(displayValue.slice(0, -1));
      return;
    }
    if (key === ".") {
      if (displayValue.includes(".")) return;
      onDisplayChange(displayValue ? `${displayValue}.` : "0.");
      return;
    }
    if (displayValue.length >= MAX_INPUT_LENGTH) return;
    onDisplayChange(displayValue === "0" ? key : displayValue + key);
  };

  return { handleKey };
};

export default useKeypadInput;
