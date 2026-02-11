import { Option } from "@components/UI/Dropdown";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useScrollFade from "@hooks/useScrollFade";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";

interface ConnectDropdownProps {
  options: Option[];
  defaultValue: string;
  menuButtonWidth?: string;
  menuItemsWidth?: string;
  menuItemsMaxHeight?: string;
  onChange?: (option: string) => void;
}

const ConnectDropdown: FC<ConnectDropdownProps> = ({
  options,
  defaultValue,
  menuButtonWidth = "w-52",
  menuItemsWidth = "w-52",
  menuItemsMaxHeight = "max-h-60",
  onChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    options.find(opt => opt.label === defaultValue)?.image,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { maskImageStyle } = useScrollFade(scrollContainerRef, options.length, [options, isMenuOpen]);

  useEffect(() => {
    setSelectedOption(defaultValue);
    const option = options.find(opt => opt.label === defaultValue);
    setSelectedImage(option?.image);
  }, [defaultValue, options]);

  const handleOptionChange = (value: string, label: string, image?: string) => {
    setSelectedOption(label);
    setSelectedImage(image);
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
              className={`${menuButtonWidth} flex items-center gap-2 bg-secondary-1 p-4 h-8 text-base text-neutral-9 font-bold focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white border border-primary-3 rounded-4xl`}
            >
              {selectedImage && (
                <Image src={selectedImage} alt={selectedOption} width={20} height={20} className="rounded-full mt-1" />
              )}
              <span>{selectedOption}</span>
              <ChevronDownIcon
                className={`text-neutral-9 w-6 h-5 mt-1 transition-transform duration-200 ease-out ${
                  open ? "rotate-180" : "rotate-0"
                }`}
              />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`${menuItemsWidth} origin-top-right rounded-2xl  bg-secondary-1 text-base text-neutral-9 transition duration-100 ease-out [--anchor-gap:--spacing(2)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              <div
                ref={scrollContainerRef}
                style={{
                  maskImage: maskImageStyle,
                  WebkitMaskImage: maskImageStyle,
                }}
                className={`${menuItemsMaxHeight} overflow-y-auto p-1`}
              >
                {options.map(option => (
                  <MenuItem key={option.value}>
                    <button
                      className="group flex w-full items-center gap-4 rounded-lg px-4 py-1.5 data-focus:bg-white/10"
                      onClick={() => handleOptionChange(option.value, option.label, option.image)}
                    >
                      {option.image && (
                        <Image
                          src={option.image}
                          alt={option.label}
                          width={20}
                          height={20}
                          className="rounded-full mt-1"
                        />
                      )}
                      <span>{option.label}</span>
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

export default ConnectDropdown;
