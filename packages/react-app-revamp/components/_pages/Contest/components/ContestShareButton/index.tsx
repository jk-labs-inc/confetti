import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { generateTwitterShareUrlForContest, generateUrlToCopy } from "@helpers/share";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { FC, Fragment, useEffect, useState } from "react";

interface ContestShareButtonProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  size?: "sm" | "md";
}

const ContestShareButton: FC<ContestShareButtonProps> = ({ contestName, contestAddress, chainName, size = "md" }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopyLink = () => {
    generateUrlToCopy(contestAddress, chainName);
    setIsCopied(true);
  };

  const buttonSize = size === "sm" ? "w-8 h-4" : "w-12 h-8";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={`flex items-center justify-center ${buttonSize} bg-gradient-metallic rounded-[40px] focus:outline-none`}
        aria-label="Share contest"
      >
        <img src="/entry/share.svg" alt="share" className={iconSize} />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-md bg-true-black shadow-sort-proposal-dropdown focus:outline-none">
          <MenuItem>
            {({ focus, close }) => (
              <a
                href={generateTwitterShareUrlForContest(contestName, contestAddress, chainName)}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className={`flex text-neutral-11 items-center text-[16px] gap-1 px-4 py-2 hover:bg-gray-700 border-b border-neutral-3 ${focus ? "bg-neutral-3" : ""}`}
              >
                <img src="/socials/twitter.svg" alt="Twitter" width={32} height={32} className="object-fit-cover mr-2" />
                <span>share on Twitter</span>
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <a
                onClick={handleCopyLink}
                className={`flex text-neutral-11 items-center text-[16px] gap-1 px-4 py-2 hover:bg-gray-700 cursor-pointer ${focus ? "bg-neutral-3" : ""}`}
              >
                {isCopied ? (
                  <CheckIcon className="h-8 w-8 text-neutral-11 mr-2" />
                ) : (
                  <DocumentDuplicateIcon className="h-8 w-8 text-neutral-11 mr-2" />
                )}
                <span>copy link</span>
              </a>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default ContestShareButton;
