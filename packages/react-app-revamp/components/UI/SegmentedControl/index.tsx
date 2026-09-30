import { ReactNode } from "react";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: ReactNode;
  leading?: ReactNode;
}

export type SegmentedControlSize = "md" | "lg";

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  className?: string;
}

const BUTTON_SIZE_CLASS_NAME: Record<SegmentedControlSize, string> = {
  md: "h-7 px-3 text-[12px]",
  lg: "h-10 px-[18px] text-[14px]",
};

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: SegmentedControlProps<T>) => (
  <div
    role="group"
    className={`inline-flex self-start items-center p-[3px] rounded-full bg-neutral-2 border border-neutral-4 ${className}`}
  >
    {options.map(option => (
      <button
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
        className={`flex items-center gap-1.5 rounded-full border border-transparent font-semibold text-neutral-9 whitespace-nowrap transition-colors aria-pressed:border-white/8 aria-pressed:bg-neutral-5 aria-pressed:font-bold aria-pressed:text-neutral-11 ${BUTTON_SIZE_CLASS_NAME[size]}`}
      >
        {option.leading}
        {option.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;
