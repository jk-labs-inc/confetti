import { Avatar } from "@components/UI/Avatar";
import { MenuButton } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ChainWithIcon } from "@config/wagmi";
import Image from "next/image";
import { FC } from "react";

interface AccountButtonProps {
  ensName: string | null | undefined;
  ensAvatar: string | null | undefined;
  displayName: string;
  currentChain?: ChainWithIcon;
}

const AccountButton: FC<AccountButtonProps> = ({ ensName, ensAvatar, displayName, currentChain }) => {
  return (
    <MenuButton
      className={`w-auto h-8 flex items-center gap-2 bg-secondary-1 p-4 text-base text-neutral-9 font-bold focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white border border-primary-3 rounded-4xl`}
    >
      {({ open }) => (
        <>
          <div className="relative shrink-0">
            <Avatar src={(ensAvatar as string) || ""} size="extraSmall" />
            {currentChain?.iconUrl && (
              <Image
                src={currentChain.iconUrl}
                alt={currentChain.name}
                width={12}
                height={12}
                className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-secondary-1"
              />
            )}
          </div>
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
