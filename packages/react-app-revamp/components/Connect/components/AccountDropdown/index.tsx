import SendFunds from "@components/SendFunds";
import { Menu, MenuItems } from "@headlessui/react";
import { FC, useState } from "react";
import { mainnet } from "viem/chains";
import { useEnsAvatar, useEnsName, useBalance } from "wagmi";
import AccountButton from "./components/AccountButton";
import ProfileSection from "./components/ProfileSection";
import NavigationLinks from "./components/NavigationLinks";
import DisconnectButton from "./components/DisconnectButton";

interface AccountDropdownProps {
  address: string;
  displayName: string;
  onDisconnect: () => void;
}

const AccountDropdown: FC<AccountDropdownProps> = ({ address, displayName, onDisconnect }) => {
  const [isSendFundsModalOpen, setIsSendFundsModalOpen] = useState(false);
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName as string, chainId: mainnet.id });
  const { data: balance } = useBalance({ address: address as `0x${string}` });

  return (
    <>
      <Menu>
        <AccountButton ensName={ensName} displayName={displayName} />

        <MenuItems
          transition
          anchor="bottom end"
          className="w-80 origin-top-right rounded-2xl bg-secondary-1 text-[16px] text-neutral-11 transition duration-100 ease-out [--anchor-gap:--spacing(2)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          <div className="flex flex-col">
            <ProfileSection
              address={address}
              ensAvatar={ensAvatar}
              ensName={ensName}
              displayName={displayName}
              balance={balance}
            />
            <NavigationLinks address={address} />
            <DisconnectButton onDisconnect={onDisconnect} />
          </div>
        </MenuItems>
      </Menu>

      {isSendFundsModalOpen && (
        <SendFunds
          isOpen={isSendFundsModalOpen}
          onClose={() => setIsSendFundsModalOpen(false)}
          recipientAddress={address}
        />
      )}
    </>
  );
};

export default AccountDropdown;
