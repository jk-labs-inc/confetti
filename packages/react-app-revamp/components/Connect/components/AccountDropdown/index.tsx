import AddFundsModal from "@components/AddFunds/components/Modal";
import SendFunds from "@components/SendFunds";
import XClaimClaimRow from "@components/XClaim/entry/XClaimClaimRow";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { Menu, MenuItem, MenuItems } from "@headlessui/react";
import { useAddFunds } from "@hooks/useAddFunds";
import { useAddFundsChain } from "@hooks/useAddFundsChain";
import { useWallet } from "@hooks/useWallet";
import { xClaimSheet } from "@hooks/useXClaim/store";
import { chains } from "@config/wagmi";
import { openOfferFor } from "lib/xClaim/view";
import type { XClaimOffer } from "lib/xClaim/types";
import { FC, useState } from "react";
import { mainnet } from "viem/chains";
import { useEnsAvatar, useEnsName, useBalance } from "wagmi";
import AccountButton from "./components/AccountButton";
import ProfileSection from "./components/ProfileSection";
import NavigationLinks from "./components/NavigationLinks";
import AdvancedOptions from "./components/AdvancedOptions";
import DisconnectButton from "./components/DisconnectButton";

interface AccountDropdownProps {
  address: string;
  displayName: string;
  onDisconnect: () => void;
  claimOffer: XClaimOffer;
}

const AccountDropdown: FC<AccountDropdownProps> = ({ address, displayName, onDisconnect, claimOffer }) => {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isSendFundsOpen, setIsSendFundsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { chainName, asset } = useAddFundsChain();
  const { chain: currentChain, changeNetworks } = useWallet();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName as string, chainId: mainnet.id });
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const { openAddFunds } = useAddFunds({ chain: chainName });
  const claimOpen = openOfferFor(claimOffer, "signed_in");

  const handleAddFunds = async () => {
    if (await openAddFunds()) return;
    setIsAddFundsOpen(true);
  };

  return (
    <>
      <Menu>
        {({ close }) => (
          <>
            <AccountButton
              address={address}
              ensName={ensName}
              ensAvatar={ensAvatar}
              displayName={displayName}
              currentChain={currentChain}
              hasClaimDot={claimOpen !== null}
            />

            <MenuItems
              transition
              anchor="bottom end"
              className="z-50 w-[360px] origin-top-right rounded-2xl bg-secondary-1 text-[16px] text-neutral-11 transition duration-100 ease-out [--anchor-gap:--spacing(2)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
            >
              <div className="flex flex-col">
                {claimOpen && (
                  <div className="px-2 pt-2">
                    <MenuItem
                      as={XClaimClaimRow}
                      id={X_CLAIM_IDS.accountMenuRow}
                      offer={claimOpen}
                      placement="menu"
                      onClick={xClaimSheet.open}
                    />
                  </div>
                )}
                <ProfileSection
                  address={address}
                  ensAvatar={ensAvatar}
                  ensName={ensName}
                  displayName={displayName}
                  balance={balance}
                  currentChain={currentChain}
                  onAddFundsClick={() => {
                    close();
                    handleAddFunds();
                  }}
                  onSendFundsClick={() => {
                    close();
                    setIsSendFundsOpen(true);
                  }}
                  onAdvancedClick={() => setIsAdvancedOpen(prev => !prev)}
                  isAdvancedOpen={isAdvancedOpen}
                />
                <AdvancedOptions
                  isOpen={isAdvancedOpen}
                  currentChain={currentChain}
                  availableChains={chains}
                  onChainSwitch={changeNetworks}
                />
                <NavigationLinks address={address} />
                <DisconnectButton onDisconnect={onDisconnect} />
              </div>
            </MenuItems>
          </>
        )}
      </Menu>

      <AddFundsModal chain={chainName} asset={asset} isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
      <SendFunds isOpen={isSendFundsOpen} onClose={() => setIsSendFundsOpen(false)} />
    </>
  );
};

export default AccountDropdown;
