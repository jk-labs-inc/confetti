import { FC, ReactNode } from "react";

interface InfoPillProps {
  tone: "grey" | "yellow";
  icon?: "clock";
  amount?: string;
  children: ReactNode;
}

const TONE_CLASS = {
  grey: "bg-neutral-2 font-bold text-neutral-11",
  yellow: "bg-primary-10 font-black text-true-black",
} as const;

const InfoPill: FC<InfoPillProps> = ({ tone, icon, amount, children }) => (
  <span
    className={`inline-flex items-center gap-2 self-center rounded-full px-4 py-2.5 text-[15px] -rotate-2 ${TONE_CLASS[tone]}`}
  >
    {icon === "clock" && (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        aria-hidden="true"
        className="text-neutral-9"
      >
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 7v5l3 2" />
      </svg>
    )}
    {amount && <span className="font-sabo-filled text-[17px] font-normal">{amount}</span>}
    {children}
  </span>
);

export default InfoPill;
