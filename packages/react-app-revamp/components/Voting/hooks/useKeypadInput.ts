import { NumericKeypadKey } from "@components/UI/NumericKeypad";

const MAX_INPUT_LENGTH = 12;

interface UseKeypadInputProps {
  displayValue: string;
  isPrefilled: boolean;
  onDisplayChange: (value: string) => void;
}

const useKeypadInput = ({ displayValue, isPrefilled, onDisplayChange }: UseKeypadInputProps) => {
  const typed = isPrefilled ? "" : displayValue;

  const handleKey = (key: NumericKeypadKey) => {
    if (key === "backspace") {
      if (!displayValue) return;
      onDisplayChange(typed.slice(0, -1));
      return;
    }
    if (key === ".") {
      if (typed.includes(".")) return;
      onDisplayChange(typed ? `${typed}.` : "0.");
      return;
    }
    if (typed.length >= MAX_INPUT_LENGTH) return;
    onDisplayChange(typed === "0" ? key : typed + key);
  };

  return { handleKey };
};

export default useKeypadInput;
