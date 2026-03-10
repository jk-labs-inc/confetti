import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { FC, Fragment, RefObject } from "react";
import useProfitCardShare from "../../hooks/useProfitCardShare";

interface ShareDropdownProps {
  cardRef: RefObject<HTMLDivElement | null>;
  profitPercentage: number;
  contestAddress: string;
  chainName: string;
}

const ShareDropdown: FC<ShareDropdownProps> = ({ cardRef, profitPercentage, contestAddress, chainName }) => {
  const { prepareImage, handleShare, handleSaveImage, isSharing } = useProfitCardShare({
    cardRef,
    profitPercentage,
    contestAddress,
    chainName,
  });

  return (
    <>
      {/* mobile: dropdown with share + download */}
      <Menu as="div" className="relative inline-block md:hidden">
        <MenuButton
          onClick={prepareImage}
          className="flex items-center justify-center w-6 h-4 rounded-[40px] bg-gradient-purple mt-1"
          aria-label="Share profit card"
        >
          <img src="/forward.svg" alt="share" className="brightness-0 w-3 h-3" />
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
          <MenuItems className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-true-black shadow-sort-proposal-dropdown focus:outline-none">
            <MenuItem>
              {({ focus, close }) => (
                <button
                  onClick={async () => {
                    close();
                    await handleShare();
                  }}
                  disabled={isSharing}
                  className={`${
                    focus ? "bg-neutral-3" : ""
                  } flex w-full items-center gap-2 px-4 py-2 text-[14px] text-neutral-11 border-b border-neutral-3`}
                >
                  {isSharing ? (
                    <div className="w-5 h-5 border-2 border-neutral-11 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <img src="/socials/twitter.svg" alt="Twitter" width={20} height={20} />
                  )}
                  <span>{isSharing ? "sharing..." : "share on twitter"}</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus, close }) => (
                <button
                  onClick={async () => {
                    close();
                    await handleSaveImage();
                  }}
                  className={`${
                    focus ? "bg-neutral-3" : ""
                  } flex w-full items-center gap-2 px-4 py-2 text-[14px] text-neutral-11`}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>save image</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>

      {/* desktop: download button only */}
      <button
        onClick={handleSaveImage}
        className="hidden md:flex items-center justify-center w-10 h-6 rounded-[40px] bg-gradient-purple mt-4"
        aria-label="Save profit card image"
      >
        <ArrowDownTrayIcon className="w-4 h-4 text-true-black" strokeWidth={2.5} />
      </button>
    </>
  );
};

export default ShareDropdown;
