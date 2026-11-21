import { FC, ReactNode } from "react";

interface GeoblockedStepProps {
  number: number;
  children: ReactNode;
}

const GeoblockedStep: FC<GeoblockedStepProps> = ({ number, children }) => (
  <li className="flex gap-2.5">
    <span
      aria-hidden="true"
      className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-5 text-[12px] font-bold"
    >
      {number}
    </span>
    <span>{children}</span>
  </li>
);

export default GeoblockedStep;
