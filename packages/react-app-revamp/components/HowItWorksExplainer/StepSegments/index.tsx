import { motion } from "motion/react";
import { FC } from "react";

interface StepSegmentsProps {
  count: number;
  index: number;
  onSelect: (index: number) => void;
}

const FILL_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

const StepSegments: FC<StepSegmentsProps> = ({ count, index, onSelect }) => (
  <div role="group" aria-label="steps" className="flex flex-1 items-center gap-1.5">
    {Array.from({ length: count }, (_, segment) => (
      <button
        key={segment}
        type="button"
        onClick={() => onSelect(segment)}
        aria-label={`step ${segment + 1} of ${count}`}
        aria-current={segment === index ? "step" : undefined}
        className="group flex h-6 flex-1 items-center"
      >
        <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-4">
          <motion.span
            className="absolute inset-0 origin-left rounded-full bg-neutral-11"
            initial={false}
            animate={{ scaleX: segment <= index ? 1 : 0 }}
            transition={FILL_TRANSITION}
          />
        </span>
      </button>
    ))}
  </div>
);

export default StepSegments;
