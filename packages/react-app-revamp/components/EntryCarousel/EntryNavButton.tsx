import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface EntryNavButtonProps {
  direction: "previous" | "next";
  onClick: () => void;
}

const EntryNavButton: FC<EntryNavButtonProps> = ({ direction, onClick }) => {
  const Icon = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <button
      type="button"
      aria-label={`${direction} entry`}
      onPointerDown={event => event.stopPropagation()}
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/6 text-neutral-11 transition-transform duration-150 ease-out active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </button>
  );
};

export default EntryNavButton;
