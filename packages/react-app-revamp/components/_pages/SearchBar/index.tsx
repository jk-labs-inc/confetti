import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import Dropdown from "@components/UI/Dropdown";
import FormField from "@components/UI/FormField";
import { FC, useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

interface SearchCriteria {
  query: string;
  filterType: string;
}

interface SearchBarProps {
  initialQuery?: string;
  isInline?: boolean;
  onSearch?: (criteria: SearchCriteria) => void;
}

const filterOptions = [
  { value: "title", label: "by title" },
  { value: "user", label: "by user" },
];

export const SearchBar: FC<SearchBarProps> = ({ isInline, onSearch }) => {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({ query: "", filterType: "title" });
  const [currentPlaceholder, setCurrentPlaceholder] = useState<string>("Search by title");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery({ maxWidth: "768px" });

  const handleFilterTypeChange = (value: string) => {
    setSearchCriteria({ ...searchCriteria, filterType: value });

    if (value === "title") {
      setCurrentPlaceholder("Search by title");
      setError(null);
    } else {
      setCurrentPlaceholder("Search by user address or ENS name");
    }
  };

  const handleQueryChange = (value: string) => {
    setSearchCriteria({ ...searchCriteria, query: value });
  };

  const executeSearch = useCallback(() => {
    if (searchCriteria.filterType === "user") {
      const hexPattern = /^0x[a-fA-F0-9]{40}$/;
      if (!hexPattern.test(searchCriteria.query) && !searchCriteria.query.endsWith(".eth")) {
        setError("Ruh-roh! Value must be a user hexadecimal address or end with .eth");
        return;
      }
    }

    setError(null);
    onSearch?.(searchCriteria);
  }, [searchCriteria, onSearch]);

  useEffect(() => {
    const handleEnterPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        executeSearch();
      }
    };

    window.addEventListener("keydown", handleEnterPress);

    return () => {
      window.removeEventListener("keydown", handleEnterPress);
    };
  }, [executeSearch]);

  return (
    <div
      className={`flex ${!isInline ? "flex-col gap-4 items-center" : "justify-center mt-12 gap-5 mb-6 items-center"}`}
      role="search"
    >
      <FormField>
        <label htmlFor="query" className="sr-only">
          Search contests
        </label>
        <div className="flex items-center border-b border-neutral-11 bg-transparent pb-2">
          <input
            autoFocus
            onChange={e => handleQueryChange(e.target.value)}
            name="query"
            className="w-[250px] sm:w-[500px] bg-transparent text-[14px] sm:text-[16px] outline-none placeholder-neutral-9 pr-2"
            placeholder={currentPlaceholder}
          />
          <Dropdown
            options={filterOptions}
            defaultValue={filterOptions[0].value}
            onChange={handleFilterTypeChange}
            menuButtonWidth="w-36"
            menuItemsWidth="w-36"
          />
        </div>
        {error && <div className="text-negative-11 mt-1 text-[14px]">{error}</div>}
      </FormField>

      <ButtonV3
        colorClass={`bg-gradient-purple rounded-[10px] font-bold text-true-black mb-2 ${
          error ? "animate-shake-top" : ""
        }`}
        size={isMobile ? ButtonSize.DEFAULT : ButtonSize.LARGE}
        onClick={executeSearch}
      >
        Search
      </ButtonV3>
    </div>
  );
};

export default SearchBar;
