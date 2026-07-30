import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import useScrollFade from "@hooks/useScrollFade";
import Fuse from "fuse.js";
import { getPhoneCountry, PHONE_COUNTRIES } from "lib/phone/countries";
import { PhoneCountry, PhoneCountryCode } from "lib/phone/types";
import { FC, useMemo, useRef, useState } from "react";

interface CountrySelectPanelProps {
  value: PhoneCountryCode;
  onSelect: (countryCode: PhoneCountryCode) => void;
}

const countrySearch = new Fuse(PHONE_COUNTRIES, {
  keys: ["name", "code", "dialCode"],
  threshold: 0.3,
  ignoreLocation: true,
});

const CountrySelectPanel: FC<CountrySelectPanelProps> = ({ value, onSelect }) => {
  const [query, setQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredCountries = useMemo(() => {
    const trimmed = query.trim();
    return trimmed ? countrySearch.search(trimmed).map(result => result.item) : PHONE_COUNTRIES;
  }, [query]);

  const { maskImageStyle } = useScrollFade(scrollContainerRef, filteredCountries.length, [filteredCountries]);

  return (
    <Combobox
      value={getPhoneCountry(value)}
      by="code"
      onChange={(country: PhoneCountry | null) => country && onSelect(country.code)}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-17">
        <MagnifyingGlassIcon className="w-4 h-4 text-neutral-10 shrink-0" aria-hidden="true" />
        <ComboboxInput
          autoFocus
          placeholder="search countries"
          onChange={event => setQuery(event.target.value)}
          className="w-full bg-transparent text-[16px] outline-none text-neutral-11 placeholder-neutral-10"
        />
      </div>
      <div
        ref={scrollContainerRef}
        style={{ maskImage: maskImageStyle, WebkitMaskImage: maskImageStyle }}
        className="max-h-60 overflow-y-auto p-1"
      >
        {filteredCountries.length ? (
          <ComboboxOptions static>
            {filteredCountries.map(country => (
              <ComboboxOption
                key={country.code}
                value={country}
                className="group flex w-full items-center gap-3 rounded-lg px-4 py-1.5 text-[16px] text-neutral-11 data-focus:bg-white/10 cursor-pointer"
              >
                <span>{country.flag}</span>
                <span className="flex-1 text-left truncate">{country.name}</span>
                <span className="text-sm text-neutral-9">{country.dialCode}</span>
                {country.code === value && <CheckIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        ) : (
          <p className="px-4 py-2 text-[14px] text-neutral-9">no countries found</p>
        )}
      </div>
    </Combobox>
  );
};

export default CountrySelectPanel;
