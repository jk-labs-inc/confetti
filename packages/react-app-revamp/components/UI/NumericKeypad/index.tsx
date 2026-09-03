import { BackspaceIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { FC } from "react";

export type NumericKeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "backspace";

const KEYPAD_LAYOUT: NumericKeypadKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

interface NumericKeypadProps {
  onKey: (key: NumericKeypadKey) => void;
}

const NumericKeypad: FC<NumericKeypadProps> = ({ onKey }) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {KEYPAD_LAYOUT.map(key => (
        <motion.button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          whileTap={{ scale: 0.95 }}
          style={{ willChange: "transform" }}
          aria-label={key === "backspace" ? "delete" : key === "." ? "decimal point" : key}
          className="flex h-12 touch-manipulation select-none items-center justify-center rounded-[16px] text-[24px] font-bold text-neutral-11 transition-colors duration-75 active:bg-neutral-4"
        >
          {key === "backspace" ? <BackspaceIcon className="h-7 w-7" /> : key}
        </motion.button>
      ))}
    </div>
  );
};

export default NumericKeypad;
