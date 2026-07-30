import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { getPhoneCountry } from "lib/phone/countries";
import { PhoneCountryCode } from "lib/phone/types";
import dynamic from "next/dynamic";
import { FC } from "react";

// defers fuse.js and the search index build until the picker is first opened
const CountrySelectPanel = dynamic(() => import("./components/Panel"), { ssr: false });

interface CountrySelectProps {
  value: PhoneCountryCode;
  onChange: (countryCode: PhoneCountryCode) => void;
}

const CountrySelect: FC<CountrySelectProps> = ({ value, onChange }) => {
  const country = getPhoneCountry(value);

  return (
    <Popover className="flex shrink-0">
      <PopoverButton
        className="group flex items-center gap-1 text-[16px] text-neutral-11 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white"
        aria-label={`country: ${country.name}`}
      >
        <span>{country.flag}</span>
        <span>{country.dialCode}</span>
        <ChevronDownIcon
          className="w-4 h-4 transition-transform duration-200 ease-out group-data-open:rotate-180"
          aria-hidden="true"
        />
      </PopoverButton>

      <PopoverPanel
        transition
        anchor="bottom start"
        className="w-72 max-w-[calc(100vw-2rem)] z-50 origin-top-left rounded-lg border border-neutral-17 bg-secondary-1 transition duration-100 ease-out [--anchor-gap:--spacing(4)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {({ close }) => (
          <CountrySelectPanel
            value={value}
            onSelect={countryCode => {
              onChange(countryCode);
              close();
            }}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
};

export default CountrySelect;
