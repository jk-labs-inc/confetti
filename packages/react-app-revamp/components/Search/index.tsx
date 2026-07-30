import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { ChangeEvent, useState } from "react";
import { debounce } from "underscore";

interface SearchProps {
  onSearchChange?: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState("");

  const debouncedOnSearchChange = debounce((value: string) => {
    onSearchChange?.(value);
  }, 300);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedOnSearchChange(value);
  };

  return (
    <div
      className={`flex items-center h-10 bg-true-black text-[16px] pl-2 w-full md:w-[220px] border-2 rounded-xl ${
        searchValue ? "border-secondary-11" : "border-neutral-9"
      } transition-colors duration-300 ease-in-out`}
    >
      <span className="text-neutral-11">
        <MagnifyingGlassIcon
          className={`w-5  transition-colors duration-300 ease-in-out ${
            searchValue ? "text-true-white" : "text-neutral-9"
          }`}
        />
      </span>
      <input
        className="bg-transparent text-true-white ml-3 outline-none w-[220px]"
        type="text"
        placeholder="search contests"
        value={searchValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default Search;
