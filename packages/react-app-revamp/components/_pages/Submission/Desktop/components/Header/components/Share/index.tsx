import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { generateTwitterShareUrlForSubmission, generateUrlSubmissions } from "@helpers/share";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { ShareIcon } from "@heroicons/react/24/solid";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import { Fragment, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const SubmissionPageDesktopHeaderShare = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopyLink = () => {
    const url = generateUrlSubmissions(contestConfig.address, contestConfig.chainName, proposalId);
    navigator.clipboard.writeText(url);
    setIsCopied(true);
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="flex items-center justify-center w-8 h-8 bg-gradient-metallic rounded-full focus:outline-none"
        aria-label="Share entry"
      >
        <ShareIcon className="w-4 h-4 text-true-black" />
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
        <MenuItems className="absolute left-0 z-50 mt-2 w-52 origin-top-left rounded-md bg-true-black shadow-sort-proposal-dropdown focus:outline-none">
          <MenuItem>
            {({ focus, close }) => (
              <a
                href={generateTwitterShareUrlForSubmission(contestConfig.address, contestConfig.chainName, proposalId)}
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

export default SubmissionPageDesktopHeaderShare;
