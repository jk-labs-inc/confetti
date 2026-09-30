import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { BoardSort } from "../../constants";

export type BoardSortControlAlign = "start" | "end";

interface BoardSortControlProps {
  sort: BoardSort;
  onSortChange: (sort: BoardSort) => void;
  align?: BoardSortControlAlign;
}

const SORT_LABELS: Record<BoardSort, string> = {
  [BoardSort.Payout]: "current payout",
  [BoardSort.Multiple]: "multiple",
};

const SORT_ORDER: BoardSort[] = [BoardSort.Payout, BoardSort.Multiple];

const MENU_ALIGN_CLASS_NAME: Record<BoardSortControlAlign, string> = {
  start: "left-0",
  end: "right-0",
};

const BoardSortControl: FC<BoardSortControlProps> = ({ sort, onSortChange, align = "end" }) => (
  <Menu as="div" className="relative self-start">
    <MenuButton
      aria-label={`sort by ${SORT_LABELS[sort]}`}
      className="flex h-7 items-center gap-1 rounded-full border border-neutral-4 bg-neutral-2 pl-3 pr-2 text-[12px] font-bold normal-case text-neutral-11"
    >
      {SORT_LABELS[sort]}
      <ChevronDownIcon className="h-3.5 w-3.5 text-neutral-9" strokeWidth={2.5} aria-hidden />
    </MenuButton>
    <MenuItems
      transition
      className={`absolute top-full z-10 mt-1.5 flex w-44 flex-col rounded-xl border border-neutral-4 bg-neutral-1 p-1 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.9)] transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0 ${MENU_ALIGN_CLASS_NAME[align]}`}
    >
      {SORT_ORDER.map(option => (
        <MenuItem key={option}>
          <button
            type="button"
            onClick={() => onSortChange(option)}
            className="flex h-8 items-center justify-between rounded-lg px-2.5 text-left text-[13px] normal-case text-neutral-11 data-focus:bg-neutral-3"
          >
            {SORT_LABELS[option]}
            {option === sort && <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
          </button>
        </MenuItem>
      ))}
    </MenuItems>
  </Menu>
);

export default BoardSortControl;
