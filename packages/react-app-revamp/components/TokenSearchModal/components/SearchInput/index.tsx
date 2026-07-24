import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TOKENLISTOOOR_SUPPORTED_CHAIN_IDS } from "@hooks/useTokenList";
import { ChangeEvent, FC, useState } from "react";
import { debounce } from "underscore";

interface TokenSearchModalSearchInputProps {
  chainId: number;
  onSearchChange?: (value: string) => void;
}

const TokenSearchModalSearchInput: FC<TokenSearchModalSearchInputProps> = ({ chainId, onSearchChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const isChainSupportedBySearch = TOKENLISTOOOR_SUPPORTED_CHAIN_IDS.includes(chainId);

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
      className={`flex items-center h-12 rounded-[15px] bg-primary-5 text-[16px] pl-4 pr-4 transition-all duration-300 ease-in-out`}
    >
      <span className="text-neutral-11">
        <MagnifyingGlassIcon
          className={`w-6 transition-colors duration-300 ease-in-out mt-1 ${
            searchValue ? "text-neutral-11" : "text-neutral-14"
          }`}
        />
      </span>
      <input
        className="text-[20px] bg-transparent text-neutral-11 ml-3 outline-none w-full"
        type="text"
        placeholder={isChainSupportedBySearch ? "search token name or paste address" : "paste token address"}
        value={searchValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default TokenSearchModalSearchInput;
