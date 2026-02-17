import { MenuButton } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface AccountButtonProps {
  ensName: string | null | undefined;
  displayName: string;
}

const AccountButton: FC<AccountButtonProps> = ({ ensName, displayName }) => {
  return (
    <MenuButton
      className={`w-auto h-8 flex items-center gap-2 bg-secondary-1 p-4 text-base text-neutral-9 font-bold focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white border border-primary-3 rounded-4xl`}
    >
      {({ open }) => (
        <>
          {ensName || displayName}
          <ChevronDownIcon
            className={`text-neutral-9 w-6 h-5 mt-1 transition-transform duration-200 ease-out ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </>
      )}
    </MenuButton>
  );
};

export default AccountButton;
