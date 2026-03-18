import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { MediaQuery } from "@helpers/mediaQuery";
import {
  generateFarcasterShareUrlForContest,
  generateLensShareUrlForContest,
  generateTwitterShareUrlForContest,
  generateUrlToCopy,
} from "@helpers/share";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { ShareIcon } from "@heroicons/react/24/solid";
import { FC, Fragment, useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface ShareDropdownProps {
  contestName: string;
  contestAddress: string;
  chain: string;
}

const ShareDropdown: FC<ShareDropdownProps> = ({ contestName, contestAddress, chain }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopyLink = () => {
    generateUrlToCopy(contestAddress, chain);
    setIsCopied(true);
  };

  return (
    <Menu as="div" className="hidden relative md:inline-block text-left">
      <MediaQuery maxWidth={768}>
        <MenuButton className="w-8 h-8 flex items-center rounded-[10px] border border-neutral-11">
          <ShareIcon className="w-4 h-4 text-neutral-11 m-auto" />
        </MenuButton>
      </MediaQuery>
      <MediaQuery minWidth={769}>
        <MenuButton className="p-2 h-8 flex items-center gap-2 text-neutral-11 text-[16px] font-bold rounded-[10px] border border-neutral-11">
          <p className="text-neutral-11 text-[16px] font-bold">share</p>
          <ShareIcon className="w-4 h-4 text-neutral-11 ml-1" />
        </MenuButton>
      </MediaQuery>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-2 w-52 overflow-x-auto origin-top-right rounded-md bg-true-black shadow-sort-proposal-dropdown focus:outline-none">
          <MenuItem>
            {({ focus, close }) => (
              <a
                target="_blank"
                href={generateLensShareUrlForContest(contestName, contestAddress, chain)}
                className={classNames(
                  focus ? "bg-neutral-3 text-gray-900" : "text-gray-700",
                  "flex text-neutral-11 items-center text-[16px] gap-1 px-4 py-2 hover:bg-gray-700  border-b border-neutral-3",
                )}
                rel="noreferrer"
                onClick={close}
              >
                <img src="/socials/lens.svg" alt="Lens" width={32} height={32} className="object-fit-cover mr-2" />
                <span className="text-left">share on Lens</span>
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus, close }) => (
              <a
                href={generateTwitterShareUrlForContest(contestName, contestAddress, chain)}
                target="_blank"
                className={classNames(
                  focus ? "bg-neutral-3 text-gray-900" : "text-gray-700",
                  "flex text-neutral-11 items-center text-[16px] gap-1 px-4 py-2 hover:bg-gray-700  border-b border-neutral-3",
                )}
                rel="noreferrer"
                onClick={close}
              >
                <img
                  src="/socials/twitter.svg"
                  alt="Twitter"
                  width={32}
                  height={32}
                  className="object-fit-cover mr-2"
                />
                <span className="text-left">share on Twitter</span>
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus, close }) => (
              <a
                href={generateFarcasterShareUrlForContest(contestName, contestAddress, chain)}
                target="_blank"
                className={classNames(
                  focus ? "bg-neutral-3 text-gray-900" : "text-gray-700",
                  "flex text-neutral-11 items-center text-[16px] gap-1 px-4 py-2 hover:bg-gray-700  border-b border-neutral-3",
                )}
                rel="noreferrer"
                onClick={close}
              >
                <img
                  src="/socials/farcaster.svg"
                  alt="Twitter"
                  width={32}
                  height={32}
                  className="object-fit-cover mr-2"
                />
                <span className="text-left">share on farcaster</span>
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <a
                onClick={handleCopyLink}
                className={classNames(
                  focus ? "bg-neutral-3 text-gray-900" : "text-gray-700",
                  "flex text-neutral-11 items-center gap-1 px-4 py-2 text-[16px] hover:bg-gray-700  cursor-pointer",
                )}
              >
                {isCopied ? (
                  <CheckIcon className="h-8 w-8 text-neutral-11 500 mr-2" />
                ) : (
                  <DocumentDuplicateIcon className="h-8 w-8 text-neutral-11 mr-2" />
                )}
                <span className="text-left">copy link</span>
              </a>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default ShareDropdown;
