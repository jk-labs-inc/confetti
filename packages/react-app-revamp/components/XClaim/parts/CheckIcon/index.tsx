import { FC } from "react";

interface CheckIconProps {
  size: number;
}

const CheckIcon: FC<CheckIconProps> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="text-positive-11"
  >
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export default CheckIcon;
