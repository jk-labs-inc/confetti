import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { returnOnlySuffix } from "@helpers/ordinalSuffix";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useScrollFade from "@hooks/useScrollFade";
import { FC, useEffect, useMemo, useRef, useState } from "react";

export interface CreateRewardsPoolDropdownOptions {
  label: string;
  value: string;
}

interface CreateRewardsPoolDropdownProps {
  options: CreateRewardsPoolDropdownOptions[];
  defaultValue: string;
  excludedValues?: string[];
  onChange?: (option: string) => void;
}

const CreateRewardsPoolDropdown: FC<CreateRewardsPoolDropdownProps> = ({
  options,
  defaultValue,
  excludedValues = [],
  onChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { maskImageStyle } = useScrollFade(scrollContainerRef, options.length, [options, isMenuOpen]);
  const filteredOptions = useMemo(() => {
    return options.filter(option => !excludedValues.includes(option.value));
  }, [options, excludedValues]);

  useEffect(() => {
    setSelectedOption(defaultValue);
  }, [defaultValue]);

  const handleOptionChange = (value: string, label: string) => {
    setSelectedOption(label);
    onChange?.(value);
  };

  return (
    <Menu>
      {({ open }) => {
        useEffect(() => {
          setIsMenuOpen(open);
        }, [open]);

        return (
          <>
            <MenuButton
              className={`w-[100px] h-8 flex items-center justify-between rounded-lg bg-secondary-1 pl-4 px-4 pr-2 text-[20px] text-neutral-11 font-bold border border-neutral-17 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:border-neutral-9 transition-all duration-200 ease-in-out`}
            >
              <span className="whitespace-nowrap">
                {selectedOption}
                <sup className="ml-[2px] text-xs">{returnOnlySuffix(Number(selectedOption))}</sup>
              </span>
              <ChevronDownIcon
                className={`text-neutral-11 w-6 h-5 mt-1 transition-transform duration-200 ease-out ${
                  open ? "rotate-180" : "rotate-0"
                }`}
              />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`w-[100px] origin-top-right rounded-lg border border-neutral-17 bg-secondary-1 text-[16px] text-neutral-11 transition duration-100 ease-out [--anchor-gap:--spacing(2)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              <div
                ref={scrollContainerRef}
                style={{
                  maskImage: maskImageStyle,
                  WebkitMaskImage: maskImageStyle,
                }}
                className="max-h-60 overflow-y-auto p-1"
              >
                {filteredOptions.map(option => (
                  <MenuItem key={option.value}>
                    <button
                      className="group flex w-full items-center gap-2 rounded-lg px-4 py-1.5 data-focus:bg-white/10"
                      onClick={() => handleOptionChange(option.value, option.label)}
                    >
                      <span className="whitespace-nowrap">
                        {option.label}
                        <sup className="ml-[2px] text-xs">{returnOnlySuffix(Number(option.value))}</sup>
                      </span>
                    </button>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </>
        );
      }}
    </Menu>
  );
};

export default CreateRewardsPoolDropdown;
