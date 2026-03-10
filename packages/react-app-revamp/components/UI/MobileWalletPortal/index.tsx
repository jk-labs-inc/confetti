import {
  ROUTE_VIEW_USER,
  ROUTE_VIEW_USER_COMMENTS,
  ROUTE_VIEW_USER_SUBMISSIONS,
  ROUTE_VIEW_USER_VOTING,
} from "@config/routes";
import { ChevronRightIcon, PowerIcon } from "@heroicons/react/24/outline";

import React, { useState } from "react";
import CustomLink from "../Link";
import AddFundsModal from "@components/AddFunds/components/Modal";
import SendFunds from "@components/SendFunds";
import Drawer from "../Drawer";
import ProfileSection from "@components/Connect/components/AccountDropdown/components/ProfileSection";
import { useAddFundsChain } from "@hooks/useAddFundsChain";
import { mainnet } from "viem/chains";
import { useEnsAvatar, useEnsName, useBalance } from "wagmi";

interface MobileProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onDisconnect: () => void;
}

const navLinks = [
  {
    href: ROUTE_VIEW_USER,
    label: "Contests",
  },
  {
    href: ROUTE_VIEW_USER_SUBMISSIONS,
    label: "Entries",
  },
  {
    href: ROUTE_VIEW_USER_VOTING,
    label: "Votes",
  },
  {
    href: ROUTE_VIEW_USER_COMMENTS,
    label: "Comments",
  },
];

export const MobileProfileDrawer: React.FC<MobileProfileDrawerProps> = ({ isOpen, onClose, address, onDisconnect }) => {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isSendFundsOpen, setIsSendFundsOpen] = useState(false);
  const { chainName, asset } = useAddFundsChain();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName as string, chainId: mainnet.id });
  const { data: balance } = useBalance({ address: address as `0x${string}` });

  const displayName = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} className="bg-secondary-1 w-full h-auto">
        <div className="flex flex-col">
          <ProfileSection
            address={address}
            ensAvatar={ensAvatar}
            ensName={ensName}
            displayName={displayName}
            balance={balance}
            onAddFundsClick={() => {
              onClose();
              setIsAddFundsOpen(true);
            }}
            onSendFundsClick={() => {
              onClose();
              setIsSendFundsOpen(true);
            }}
          />
          <div className="flex flex-col p-2">
            {navLinks.map(link => (
              <CustomLink
                key={link.href}
                href={link.href.replace("[address]", address)}
                className="flex gap-2 items-center justify-between text-[16px] font-bold text-neutral-11 uppercase px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span>my {link.label}</span>
                <ChevronRightIcon width={16} height={16} className="text-neutral-11" />
              </CustomLink>
            ))}
          </div>
          <div className="border-t border-neutral-17 p-2">
            <button
              onClick={onDisconnect}
              className="flex flex-col gap-2 w-full items-center justify-center text-[16px] font-bold uppercase px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <PowerIcon width={32} height={32} className="text-negative-11" />
              <p className="text-base font-bold text-neutral-11">disconnect wallet</p>
            </button>
          </div>
        </div>
      </Drawer>
      <AddFundsModal
        chain={chainName}
        asset={asset}
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
      />
      <SendFunds isOpen={isSendFundsOpen} onClose={() => setIsSendFundsOpen(false)} />
    </>
  );
};
