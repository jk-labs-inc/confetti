import Drawer from "@components/UI/Drawer";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useScrollFade from "@hooks/useScrollFade";
import { FC, useRef, useState } from "react";

interface MobileSelectorOption {
  label: string;
  value: string;
  description?: string;
}

interface MobileSelectorProps {
  label: string;
  value: string;
  options: MobileSelectorOption[];
  onChange: (value: string) => void;
  width?: string;
}

const MobileSelector: FC<MobileSelectorProps> = ({ label, value, options, onChange, width = "w-[168px]" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { maskImageStyle } = useScrollFade(scrollContainerRef, options.length, [options, isOpen]);
  const selectedDescription = options.find(option => option.label === value)?.description;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${width} flex items-center justify-between gap-2 whitespace-nowrap rounded-lg bg-secondary-1 p-4 h-10 text-[20px] text-neutral-11 font-bold border border-neutral-17`}
      >
        <span className="flex items-baseline gap-1.5">
          <span>{value}</span>
          {selectedDescription && <span className="text-sm font-normal text-neutral-9">{selectedDescription}</span>}
        </span>
        <ChevronDownIcon className="text-neutral-11 w-6 h-5 mt-1" />
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-true-black">
        <div className="bg-true-black pb-8 px-6">
          <p className="text-[24px] font-bold text-neutral-11 mb-6">{label}</p>
          <div
            ref={scrollContainerRef}
            style={{
              maskImage: maskImageStyle,
              WebkitMaskImage: maskImageStyle,
            }}
            className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto"
          >
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`text-left p-4 rounded-lg text-[20px] transition-colors ${
                  option.label === value
                    ? "bg-primary-1 text-neutral-11 border-neutral-17 font-bold border"
                    : "text-neutral-11 hover:bg-neutral-2 bg-true-black"
                }`}
              >
                <span className="flex items-baseline gap-1.5">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-sm font-normal text-neutral-9">{option.description}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MobileSelector;
